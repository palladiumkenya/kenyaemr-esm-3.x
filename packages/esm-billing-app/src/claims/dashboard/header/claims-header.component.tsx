import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './claims-header.scss';
import ClaimMainComponent from '../../claims-wrap/claims-main-component';
import { MappedBill } from '../../../types';

interface ClaimsHeaderProps {
  patient: fhir.Patient;
  bill: MappedBill;
}

const ClaimsHeader: React.FC<ClaimsHeaderProps> = ({ patient, bill }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.claimContainer}>
      {patient && <ExtensionSlot name="patient-header-slot" state={{ patientUuid: patient.id, patient }} />}
      <div className={styles.detailsContainer}>
        <span className={styles.claimTitle}> {t('createClaim', 'Create Claim')}</span>
      </div>
      <ClaimMainComponent bill={bill} />
    </div>
  );
};

export default ClaimsHeader;
