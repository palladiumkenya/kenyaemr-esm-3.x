import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, formatDatetime, parseDate, usePatient, useVisit } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBill } from '../billing.resource';
import { usePaymentsReconciler } from '../hooks/use-payments-reconciler';
import { LineItem, MappedBill } from '../types';
import InvoiceTable from './invoice-table.component';
import styles from './invoice.scss';
import Payments from './payments/payments.component';
import capitalize from 'lodash-es/capitalize';
import { InvoiceActions } from './invoice-actions.component';
import { useCurrencyFormatting } from '../helpers/currency';

const Invoice: React.FC = () => {
  const { t } = useTranslation();
  const { billUuid, patientUuid } = useParams();
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error: billingError } = useBill(billUuid);
  usePaymentsReconciler(billUuid);
  const { activeVisit, isLoading: isVisitLoading, error: visitError } = useVisit(patientUuid);
  const [selectedLineItems, setSelectedLineItems] = useState([]);

  const handleSelectItem = (lineItems: Array<LineItem>) => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    const uniqueLineItems = [...new Set([...lineItems, ...paidLineItems])];
    setSelectedLineItems(uniqueLineItems);
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

  return (
    <div className={styles.invoiceContainer}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <InvoiceSummary bill={bill} selectedLineItems={selectedLineItems} activeVisit={activeVisit} />
      <InvoiceTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
      <Payments bill={bill} selectedLineItems={selectedLineItems} />
    </div>
  );
};

export function InvoiceSummary({
  bill,
  selectedLineItems,
  activeVisit,
}: {
  readonly bill: MappedBill;
  readonly selectedLineItems?: LineItem[];
  readonly activeVisit?: any;
}) {
  const { t } = useTranslation();
  const { format: formatCurrency } = useCurrencyFormatting();

  return (
    <>
      <div className={styles.invoiceSummary}>
        <span className={styles.invoiceSummaryTitle}>{t('invoiceSummary', 'Invoice Summary')}</span>
        <InvoiceActions bill={bill} selectedLineItems={selectedLineItems} activeVisit={activeVisit} />
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
          <InvoiceSummaryItem label={t('totalAmount', 'Total Amount')} value={formatCurrency(bill?.totalAmount)} />
          <InvoiceSummaryItem
            label={t('totalExempted', 'Total Exempted')}
            value={formatCurrency(bill?.totalExempted)}
          />
          <InvoiceSummaryItem
            label={t('totalPayments', 'Total Payments')}
            value={formatCurrency(bill?.totalPayments)}
          />
          <InvoiceSummaryItem
            label={t('totalDeposits', 'Total Deposits')}
            value={formatCurrency(bill?.totalDeposits)}
          />
          <InvoiceSummaryItem label={t('balance', 'Balance')} value={formatCurrency(bill?.balance)} />
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
