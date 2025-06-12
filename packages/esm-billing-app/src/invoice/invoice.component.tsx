import { Button, InlineLoading } from '@carbon/react';
import { BaggageClaim, Printer, Wallet } from '@carbon/react/icons';
import {
  defaultVisitCustomRepresentation,
  ExtensionSlot,
  formatDatetime,
  navigate,
  parseDate,
  restBaseUrl,
  showModal,
  showSnackbar,
  showToast,
  updateVisit,
  useFeatureFlag,
  usePatient,
  useVisit,
  useVisitContextStore,
} from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useBill, useDefaultFacility } from '../billing.resource';
import { spaBasePath } from '../constants';
import { convertToCurrency } from '../helpers';
import { usePaymentsReconciler } from '../hooks/use-payments-reconciler';
import { LineItem, MappedBill } from '../types';
import InvoiceTable from './invoice-table.component';
import { useShaFacilityStatus } from './invoice.resource';
import styles from './invoice.scss';
import Payments from './payments/payments.component';
import ReceiptPrintButton from './print-bill-receipt/receipt-print-button.component';
import PrintableInvoice from './printable-invoice/printable-invoice.component';
import capitalize from 'lodash-es/capitalize';
import { mutate } from 'swr';

const Invoice: React.FC = () => {
  const { t } = useTranslation();
  const { data: facilityInfo } = useDefaultFacility();
  const { shaFacilityStatus } = useShaFacilityStatus();
  const { billUuid, patientUuid } = useParams();
  const [isPrinting, setIsPrinting] = useState(false);
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error: billingError } = useBill(billUuid);
  const isInsurancePayment = (payments) => {
    return payments?.some((payment) => payment.instanceType.name === 'Insurance');
  };
  usePaymentsReconciler(billUuid);
  const { activeVisit, isLoading: isVisitLoading, error: visitError } = useVisit(patientUuid);
  const { patientUuid: visitStorePatientUuid, manuallySetVisitUuid } = useVisitContextStore();
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const isProcessClaimsFormEnabled = useFeatureFlag('healthInformationExchange');

  const isShaFacilityStatusValid =
    shaFacilityStatus &&
    shaFacilityStatus.shaFacilityId &&
    shaFacilityStatus.operationalStatus &&
    shaFacilityStatus?.registrationNumber;

  const handleSelectItem = (lineItems: Array<LineItem>) => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    const uniqueLineItems = [...new Set([...lineItems, ...paidLineItems])];
    setSelectedLineItems(uniqueLineItems);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice ${bill?.receiptNumber} - ${patient?.name?.[0]?.given?.join(' ')} ${
      patient?.name?.[0].family
    }`,
    onBeforePrint: async () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint() {
      setIsPrinting(false);
    },
  });

  const handleBillPayment = () => {
    const dispose = showModal('initiate-payment-modal', {
      closeModal: () => dispose(),
      bill: bill,
      selectedLineItems,
    });
  };

  const mutateClaimForm = async () => {
    const activeVisitUrlSuffix = `?patient=${patientUuid}&v=${defaultVisitCustomRepresentation}&includeInactive=false`;
    const retrospectiveVisitUuid = patientUuid && visitStorePatientUuid == patientUuid ? manuallySetVisitUuid : null;
    const retrospectiveVisitUrlSuffix = `/${retrospectiveVisitUuid}?v=${defaultVisitCustomRepresentation}`;
    const activeVisitUrl = `${restBaseUrl}/visit${activeVisitUrlSuffix}`;
    const retroVisitUrl = `${restBaseUrl}/visit${retrospectiveVisitUrlSuffix}`;
    await mutate((key) => typeof key === 'string' && (key.startsWith(activeVisitUrl) || key.startsWith(retroVisitUrl)));
  };

  useEffect(() => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    setSelectedLineItems(paidLineItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill?.lineItems?.length]);

  if (isLoadingPatient || isLoadingBill || isVisitLoading) {
    return (
      <div className={styles.invoiceContainer}>
        <InlineLoading
          className={styles.loader}
          status="active"
          iconDescription="Loading"
          description="Loading patient header..."
        />
      </div>
    );
  }

  if (billingError || patientError || visitError) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState
          headerTitle={t('invoiceError', 'Invoice error')}
          error={billingError ?? patientError ?? visitError}
        />
      </div>
    );
  }

  const handleEndVisit = async () => {
    if (activeVisit) {
      const endVisitPayload = {
        stopDatetime: new Date(),
      };

      const abortController = new AbortController();
      try {
        await updateVisit(activeVisit.uuid, endVisitPayload, abortController);
        await mutateClaimForm();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('visitEndSuccessssfully', 'visit ended successfully'),
          title: t('visitEnded', 'Visit ended'),
        });
      } catch (error) {
        showSnackbar({
          title: t('errorEndingVisit', 'Error ending visit'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      }
    }
  };

  const handleViewClaims = async () => {
    if (!isShaFacilityStatusValid) {
      showToast({
        critical: true,
        kind: 'warning',
        title: t('shaFacilityLicenseNumberRequired', 'Facility license number Required'),
        description: t(
          'shaFacilityLicenseNumbernRequiredDescription',
          'Facility license number is required to process claims. Please update facility license number details.',
        ),
      });
      return;
    }

    if (activeVisit) {
      await handleEndVisit();
      navigate({ to: `${spaBasePath}/billing/patient/${patientUuid}/${billUuid}/claims` });
    } else {
      navigate({ to: `${spaBasePath}/billing/patient/${patientUuid}/${billUuid}/claims` });
    }
  };

  return (
    <div className={styles.invoiceContainer}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <InvoiceSummary bill={bill} />
      <div className={styles.actionArea}>
        <ReceiptPrintButton bill={bill} />
        <Button
          onClick={handlePrint}
          kind="tertiary"
          size="sm"
          disabled={isPrinting}
          renderIcon={Printer}
          iconDescription="Add"
          tooltipPosition="right">
          {isPrinting ? t('printingInvoice', 'Printing invoice...') : t('printInvoice', 'Print invoice')}
        </Button>
        <Button
          onClick={handleBillPayment}
          disabled={bill?.status === 'PAID'}
          size="sm"
          renderIcon={Wallet}
          iconDescription="Add"
          tooltipPosition="left">
          {t('mpesaPayment', 'MPESA Payment')}
        </Button>

        {isProcessClaimsFormEnabled && isInsurancePayment(bill?.payments) && (
          <Button
            onClick={handleViewClaims}
            disabled={bill?.status !== 'PAID'}
            kind="danger"
            size="sm"
            renderIcon={BaggageClaim}
            iconDescription="Add"
            tooltipPosition="bottom">
            {activeVisit ? t('endVisitAndClaim', 'End visit and Process claims') : t('claim', 'Process claims')}
          </Button>
        )}
      </div>

      <InvoiceTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
      <Payments bill={bill} selectedLineItems={selectedLineItems} />

      <div className={styles.printContainer}>
        <PrintableInvoice
          ref={componentRef}
          facilityInfo={facilityInfo}
          bill={bill}
          patient={patient}
          isPrinting={isPrinting}
        />
      </div>
    </div>
  );
};

function InvoiceSummary({ bill }: { readonly bill: MappedBill }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.invoiceSummary}>
        <span className={styles.invoiceSummaryTitle}>{t('invoiceSummary', 'Invoice Summary')}</span>
      </div>
      <div className={styles.invoiceSummaryContainer}>
        <div className={styles.invoiceCard}>
          <InvoiceSummaryItem label={t('invoiceNumber', 'Invoice Number')} value={bill.receiptNumber} />
          <InvoiceSummaryItem
            label={t('dateAndTime', 'Date And Time')}
            value={formatDatetime(parseDate(bill.dateCreated), { mode: 'standard', noToday: true })}
          />
          <InvoiceSummaryItem label={t('invoiceStatus', 'Invoice Status')} value={bill?.status} />
          <InvoiceSummaryItem label={t('cashPoint', 'Cash Point')} value={bill?.cashPointName} />
          <InvoiceSummaryItem label={t('cashier', 'Cashier')} value={capitalize(bill?.cashier?.display)} />
        </div>
        <div className={styles.divider} />
        <div className={styles.invoiceCard}>
          <InvoiceSummaryItem label={t('totalAmount', 'Total Amount')} value={convertToCurrency(bill?.totalAmount)} />
          <InvoiceSummaryItem
            label={t('totalExempted', 'Total Exempted')}
            value={convertToCurrency(bill?.totalExempted)}
          />
          <InvoiceSummaryItem
            label={t('totalPayments', 'Total Payments')}
            value={convertToCurrency(bill?.totalPayments)}
          />
          <InvoiceSummaryItem
            label={t('totalDeposits', 'Total Deposits')}
            value={convertToCurrency(bill?.totalDeposits)}
          />
          <InvoiceSummaryItem label={t('balance', 'Balance')} value={convertToCurrency(bill?.balance)} />
        </div>
      </div>
    </>
  );
}

function InvoiceSummaryItem({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div className={styles.invoiceSummaryItem}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default Invoice;
