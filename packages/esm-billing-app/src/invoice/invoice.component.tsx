import React from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, navigate, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import styles from './invoice.scss';
import InvoiceTable from './invoice-table.component';
import Payments from './payments/payments.component';
import { useTranslation } from 'react-i18next';
import { useBill } from '../billing.resource';

type InvoiceProps = {};

const Invoice: React.FC<InvoiceProps> = () => {
  const params = useParams();
  const layout = useLayoutType();
  const { patient, patientUuid, isLoading } = usePatient(params?.patientUuid);
  const { bill } = useBill(params?.billUuid);

  const invoiceDetails = {
    'Total Amount': bill?.totalAmount,
    'Amount Tendered': bill?.tenderedAmount,
    'Invoice Number': bill.receiptNumber,
    'Date And Time': bill?.dateCreated,
    'Invoice Status': bill?.status,
  };

  const invoiceTotal = {
    'Total Amount': bill?.totalAmount,
    'Amount Tendered': bill?.tenderedAmount,
    'Discount Amount': 0,
    'Amount due': bill?.totalAmount - bill?.tenderedAmount,
  };

  const navigateToDashboard = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + 'home/billing',
    });

  if (isLoading) {
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

  return (
    <div className={styles.invoiceContainer}>
      <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />
      <section className={styles.details}>
        {Object.entries(invoiceDetails).map(([key, val]) => (
          <InvoiceDetails key={key} label={key} value={val} />
        ))}
      </section>

      <div className={styles.backButton}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription="Return to billing dashboard"
          size="sm"
          onClick={navigateToDashboard}>
          <span>Back to dashboard</span>
        </Button>
      </div>

      <div>
        <InvoiceTable />
        <div className={styles.paymentSection}>
          <Payments />
          <div className={styles.invoicePaymentsContainer}>
            {Object.entries(invoiceTotal).map(([key, val]) => (
              <InvoicePaymentBreakdown label={key} value={val} />
            ))}
          </div>
        </div>
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

interface InvoicePaymentBreakdown {
  label: string;
  value: number;
}

function InvoicePaymentBreakdown({ label, value }: InvoicePaymentBreakdown) {
  const { t } = useTranslation();

  return (
    <div className={styles.label}>
      {label} : <span className={styles.billDetail}>{value}</span>
      {/* <div className={styles.label}>
        {t('totalBill', 'Total bill')} : <span className={styles.billDetail}>{totalBill}</span>
      </div>
      <div className={styles.label}>
        {t('tenderedBill', 'Tendered bill')} : <span className={styles.billDetail}>{tenderedBill}</span>
      </div>
      <div className={styles.label}>
        {t('discount', 'Discount')} : <span className={styles.billDetail}>{discount}</span>
      </div>
      <div className={styles.label}>
        {t('amountDue', 'Amount due')} : <span className={styles.billDetail}>{amount}</span>
      </div> */}
    </div>
  );
}
