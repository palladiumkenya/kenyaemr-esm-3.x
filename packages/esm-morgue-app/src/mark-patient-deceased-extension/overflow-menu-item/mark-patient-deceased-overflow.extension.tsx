import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import styles from './mark-patient-deceased-overflow.scss';

interface MarkPatientDeceasedOverflowMenuItemProps {
  patientUuid?: string;
  patient?: fhir.Patient;
}

const MarkPatientDeceasedOverflowMenuItem: React.FC<MarkPatientDeceasedOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isDead = patient.deceasedBoolean ?? Boolean(patient.deceasedDateTime);

  const handleLaunchModal = useCallback(() => launchWorkspace('mortuary-mark-patient-deceased-workspace-form'), []);

  return (
    patient &&
    !isDead && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('markPatientDeceased', 'Mark patient deceased')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
