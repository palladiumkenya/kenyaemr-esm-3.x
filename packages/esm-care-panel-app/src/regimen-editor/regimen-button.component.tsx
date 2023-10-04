import React from 'react';
import { Link } from '@carbon/react';

import { useTranslation } from 'react-i18next';
import { RegimenType } from '../types';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './standard-regimen.scss';

interface RegimenButtonProps {
  patientUuid: string;
  category: string;
  onRegimen: string;
  lastRegimenEncounter: {
    uuid: string;
    startDate: string;
    endDate: string;
    event: string;
  };
}

const RegimenButton: React.FC<RegimenButtonProps> = ({ category, patientUuid, onRegimen, lastRegimenEncounter }) => {
  const { t } = useTranslation();
  return (
    <Link
      className={styles.linkName}
      onClick={() =>
        launchPatientWorkspace('patient-regimen-workspace', {
          category: RegimenType[category],
          patientUuid: patientUuid,
          onRegimen: onRegimen,
          lastRegimenEncounter: lastRegimenEncounter,
        })
      }>
      {t('editRegimen', 'Edit')}
    </Link>
  );
};

export default RegimenButton;
