import { Button, InlineLoading, Popover, PopoverContent } from '@carbon/react';
import { BaggageClaim, Close, Printer, Wallet, FolderOpen } from '@carbon/react/icons';
import {
  defaultVisitCustomRepresentation,
  ExtensionSlot,
  formatDatetime,
  launchWorkspace,
  navigate,
  parseDate,
  restBaseUrl,
  showModal,
  showSnackbar,
  showToast,
  updateVisit,
  useFeatureFlag,
  usePatient,
  UserHasAccess,
  useVisit,
  useVisitContextStore,
} from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBill } from '../billing.resource';
import { spaBasePath } from '../constants';
import { convertToCurrency } from '../helpers';
import { usePaymentsReconciler } from '../hooks/use-payments-reconciler';
import { LineItem, MappedBill } from '../types';
import InvoiceTable from './invoice-table.component';
import { useShaFacilityStatus } from './invoice.resource';
import styles from './invoice.scss';
import Payments from './payments/payments.component';
import capitalize from 'lodash-es/capitalize';
import { mutate } from 'swr';
import startCase from 'lodash-es/startCase';

const Invoice: React.FC = () => {
  const { t } = useTranslation();
  const { shaFacilityStatus } = useShaFacilityStatus();
  const { billUuid, patientUuid } = useParams();
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error: billingError } = useBill(billUuid);
  const isInsurancePayment = (payments) => {
    return payments?.some((payment) => payment.instanceType.name === 'Insurance');
  };
  usePaymentsReconciler(billUuid);
  const { activeVisit, isLoading: isVisitLoading, error: visitError } = useVisit(patientUuid);
  const { patientUuid: visitStorePatientUuid, manuallySetVisitUuid } = useVisitContextStore();
  const [selectedLineItems, setSelectedLineItems] = useState([]);
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

  const handlePrint = () => {
    const dispose = showModal('print-preview-modal', {
      onClose: () => dispose(),
      title: `${t('invoice', 'Invoice')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
      documentUrl: `/openmrs${restBaseUrl}/cashier/print?documentType=invoice&billId=${bill?.id}`,
    });
  };

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
        <Button
          onClick={handleBillPayment}
          disabled={bill?.balance === 0}
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
    </div>
  );
};

export function InvoiceSummary({ bill }: { readonly bill: MappedBill }) {
  const { t } = useTranslation();
  const launchBillCloseOrReopenModal = (action: 'close' | 'reopen') => {
    const dispose = showModal('bill-action-modal', {
      closeModal: () => dispose(),
      bill: bill,
      action,
    });
  };

  const shouldCloseBill = bill.balance === 0 && !bill.closed;
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = (documentType: string, documentTitle: string) => {
    const dispose = showModal('print-preview-modal', {
      onClose: () => dispose(),
      title: documentTitle,
      documentUrl: `/openmrs${restBaseUrl}/cashier/print?documentType=${documentType}&billId=${bill?.id}`,
    });
  };

  return (
    <>
      <div className={styles.invoiceSummary}>
        <span className={styles.invoiceSummaryTitle}>{t('invoiceSummary', 'Invoice Summary')}</span>
        <div className="invoiceSummaryActions">
          <Popover
            isTabTip
            align="bottom-right"
            onKeyDown={() => {}}
            onRequestClose={() => setIsOpen(false)}
            open={isOpen}>
            <button
              className={styles.printButton}
              aria-expanded
              aria-label="Settings"
              onClick={() => setIsOpen(!isOpen)}
              type="button">
              <span className={styles.printButtonContent}>
                <span className={styles.printButtonText}>{t('print', 'Print')}</span>
                <Printer />
              </span>
            </button>
            <PopoverContent>
              <div className={styles.popoverContent}>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() =>
                    handlePrint(
                      'invoice',
                      `${t('invoice', 'Invoice')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
                    )
                  }
                  renderIcon={Printer}>
                  {t('printInvoice', 'Print Invoice')}
                </Button>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => {
                    const dispose = showModal('print-preview-modal', {
                      onClose: () => dispose(),
                      title: `${t('receipt', 'Receipt')} ${bill?.receiptNumber} - ${startCase(bill?.patientName)}`,
                      documentUrl: `/openmrs${restBaseUrl}/cashier/receipt?billId=${bill.id}`,
                    });
                  }}
                  renderIcon={Printer}>
                  {t('printReceipt', 'Print Receipt')}
                </Button>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() =>
                    handlePrint(
                      'billstatement',
                      `${t('billStatement', 'Bill Statement')} ${bill?.receiptNumber} - ${startCase(
                        bill?.patientName,
                      )}`,
                    )
                  }
                  renderIcon={Printer}>
                  {t('printBillStatement', 'Print Bill Statement')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {shouldCloseBill && (
            <UserHasAccess privilege="Close Cashier Bills">
              <Button
                kind="danger--ghost"
                size="sm"
                renderIcon={Close}
                iconDescription="Add"
                tooltipPosition="right"
                onClick={() => launchBillCloseOrReopenModal('close')}>
                {t('closeBill', 'Close Bill')}
              </Button>
            </UserHasAccess>
          )}
          {bill?.closed && (
            <UserHasAccess privilege="Reopen Cashier Bills">
              <Button
                kind="ghost"
                size="sm"
                renderIcon={FolderOpen}
                iconDescription="Add"
                tooltipPosition="right"
                onClick={() => launchBillCloseOrReopenModal('reopen')}>
                {t('reopen', 'Reopen')}
              </Button>
            </UserHasAccess>
          )}
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Wallet}
            iconDescription="Add"
            tooltipPosition="right"
            onClick={() =>
              launchWorkspace('payment-workspace', {
                bill,
                workspaceTitle: t('additionalPayment', 'Additional Payment (Balance {{billBalance}})', {
                  billBalance: convertToCurrency(bill.balance),
                }),
              })
            }>
            {t('additionalPayment', 'Additional Payment')}
          </Button>
        </div>
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

export function InvoiceSummaryItem({ label, value }: { readonly label: string; readonly value: string | number }) {
  return (
    <div className={styles.invoiceSummaryItem}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default Invoice;
