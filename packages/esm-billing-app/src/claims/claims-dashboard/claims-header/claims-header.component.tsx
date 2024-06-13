// Filename: claims-header.component.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './claims-header.scss';
import { MappedBill } from '../../../types';
import ClaimsTable from '../claims-table.component.tsx/claims-table.component';

interface ClaimsHeaderProps {
  patient: fhir.Patient;
  bill: MappedBill;
}

const ClaimsHeader: React.FC<ClaimsHeaderProps> = ({ patient, bill }) => {
  const { t } = useTranslation();
  console.log('patient', patient);
  console.log('billUuid', bill);
  return (
    <div className={styles.claimContainer}>
      {patient && <ExtensionSlot name="patient-header-slot" state={{ patientUuid: patient.id, patient }} />}
      <div className={styles.detailsContainer}>
        <span className={styles.claimTitle}> {t('createClaim', 'Create Claim')}</span>
      </div>
      <ClaimsTable bill={bill} />
    </div>
  );
};

export default ClaimsHeader;
