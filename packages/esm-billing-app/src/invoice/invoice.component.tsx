import React from 'react';
import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import styles from './invoice.scss';
import InvoiceTable from './invoice-table.component';
import Payments from './payments/payments.component';
import { useBill } from '../billing.resource';
import { convertToCurrency } from '../helpers';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

type InvoiceProps = {};

const Invoice: React.FC<InvoiceProps> = () => {
  const params = useParams();
  const { t } = useTranslation();
  const { patient, patientUuid, isLoading } = usePatient(params?.patientUuid);
  const { bill, isLoading: isLoadingBilling, error } = useBill(params?.billUuid);

  const invoiceDetails = {
    'Total Amount': convertToCurrency(bill?.totalAmount),
    'Amount Tendered': convertToCurrency(bill?.tenderedAmount),
    'Invoice Number': bill.receiptNumber,
    'Date And Time': bill?.dateCreated,
    'Invoice Status': bill?.status,
  };

  if (isLoading && isLoadingBilling) {
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

  if (error) {
    return <ErrorState headerTitle={t('invoiceError', 'Invoice error')} error={error} />;
  }

  return (
    <div className={styles.invoiceContainer}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <section className={styles.details}>
        {Object.entries(invoiceDetails).map(([key, val]) => (
          <InvoiceDetails key={key} label={key} value={val} />
        ))}
      </section>

      <div>
        <InvoiceTable billUuid={bill?.uuid} />
        {bill && <Payments bill={bill} />}
      </div>
    </div>
  );
};

interface InvoiceDetailsProps {
  label: string;
  value: string | number;
}

function InvoiceDetails({ label, value }: InvoiceDetailsProps) {
  return (
    <div>
      <h1 className={styles.label}>{label}</h1>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default Invoice;
