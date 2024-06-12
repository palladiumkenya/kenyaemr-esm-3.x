// Filename: claims-header.component.tsx

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import styles from './claims-header.scss';

interface ClaimsHeaderProps {
  patient: fhir.Patient;
  billUuid: string;
}

const ClaimsHeader: React.FC<ClaimsHeaderProps> = ({ patient, billUuid }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.invoiceContainer}>
      {patient && <ExtensionSlot name="patient-header-slot" state={{ patientUuid: patient.id, patient }} />}
    </div>
  );
};

export default ClaimsHeader;
