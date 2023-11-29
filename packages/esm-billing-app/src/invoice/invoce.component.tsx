import React from 'react';
import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import styles from './invoice.scss';

type InvoiceProps = {};

const Invoice: React.FC<InvoiceProps> = () => {
  const params = useParams();
  const { patient, patientUuid, isLoading } = usePatient(params?.patientUuid);

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading patient info..." />;
  }

  return (
    <div className={styles.invoiceContainer}>
      <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />
    </div>
  );
};

export default Invoice;
