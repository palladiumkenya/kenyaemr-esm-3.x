import React from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, navigate, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import styles from './invoice.scss';

type InvoiceProps = {};

const Invoice: React.FC<InvoiceProps> = () => {
  const params = useParams();
  const layout = useLayoutType();
  const { patient, patientUuid, isLoading } = usePatient(params?.patientUuid);

  const invoiceDetails = {
    'Invoice Number': '#105986',
    'Billing Date & Time': 'Thu 04 Nov, 2023 01:20 pm',
    'Total Amount': 'Ksh. 1000',
    'Invoice Status': 'Pending',
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
        {Object.entries(invoiceDetails).map(([label, value]) => (
          <InvoiceDetails key={label} label={label} value={value} />
        ))}
      </section>

      {isDesktop(layout) && (
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
      )}
    </div>
  );
};

interface InvoiceDetailsProps {
  label: string;
  value: string;
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
