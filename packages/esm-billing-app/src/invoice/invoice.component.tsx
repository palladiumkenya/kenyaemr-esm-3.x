import React from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, navigate, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import styles from './invoice.scss';
import InvoiceTable from './invoice-table.component';
import Payments from './payments/payments.component';
import { useTranslation } from 'react-i18next';
import { useBills } from '../billing.resource';

type InvoiceProps = {};

const Invoice: React.FC<InvoiceProps> = () => {
  const params = useParams();
  const layout = useLayoutType();
  const { patient, patientUuid, isLoading } = usePatient(params?.patientUuid);
  const { bills } = useBills('');
  const patientBills = bills?.filter((bill) => bill.patientUuid === params?.patientUuid) ?? [];

  const invoiceDetails = patientBills
    .map((bill, index) => {
      return {
        'Total Amount': patientBills
          .flatMap((bill) => bill.lineItems.map((item) => item.price * item.quantity))
          .reduce((prev, curr) => prev + curr, 0),
        'Amount Tendered': patientBills
          .flatMap((bill) => bill.payments.map((item) => item.amountTendered))
          .reduce((prev, curr) => prev + curr, 0),
        'Invoice Number': '#105986',
        'Date And Time': bill.dateCreated,
        'Invoice Status': bill.status,
      };
    })
    .slice(-1);

  const invoiceTotal = patientBills.map((bill, index) => {
    return {
      totalAmount: patientBills
        .flatMap((bill) => bill.lineItems.map((item) => item.price * item.quantity))
        .reduce((prev, curr) => prev + curr, 0),
      amountTendered: patientBills
        .flatMap((bill) => bill.payments.map((item) => item.amountTendered))
        .reduce((prev, curr) => prev + curr, 0),
    };
  });

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
        {invoiceDetails.map((details, index) =>
          Object.entries(details).map(([key, val]) => <InvoiceDetails key={key} label={key} value={val} />),
        )}
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
          <InvoicePaymentBreakdown
            totalBill={invoiceTotal[0]?.totalAmount}
            tenderedBill={invoiceTotal[0]?.amountTendered}
            amount={invoiceTotal[0]?.totalAmount}
            discount={0}
          />
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
  totalBill: number;
  tenderedBill: number;
  discount: number;
  amount: number;
}

function InvoicePaymentBreakdown({ totalBill, tenderedBill, discount, amount }: InvoicePaymentBreakdown) {
  const { t } = useTranslation();

  return (
    <div className={styles.invoicePaymentBreakdownContainer}>
      <div className={styles.label}>
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
      </div>
    </div>
  );
}
