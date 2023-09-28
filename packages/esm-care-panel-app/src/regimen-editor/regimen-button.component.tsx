import React from 'react';
import { Edit } from '@carbon/react/icons';

import { useTranslation } from 'react-i18next';
import { RegimenType } from '../types';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

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
    <>
      <Edit
        onClick={() =>
          launchPatientWorkspace('patient-regimen-workspace', {
            category: RegimenType[category],
            patientUuid: patientUuid,
            onRegimen: onRegimen,
            lastRegimenEncounter: lastRegimenEncounter,
          })
        }
        style={{ cursor: 'pointer' }}
      />
    </>
  );
};

export default RegimenButton;
