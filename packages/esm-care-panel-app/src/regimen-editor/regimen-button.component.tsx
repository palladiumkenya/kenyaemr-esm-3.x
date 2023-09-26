import React from 'react';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import { useTranslation } from 'react-i18next';

import { launchOverlay } from '../hooks/useOverlay';
import RegimenForm from './regimen-form.component';
import { RegimenType } from '../types';

interface RegimenButtonProps {
  patientUuid: string;
  category: string;
  onRegimen: string;
  lastRegimenEncounterUuid: string;
}

const RegimenButton: React.FC<RegimenButtonProps> = ({
  category,
  patientUuid,
  onRegimen,
  lastRegimenEncounterUuid,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Edit
        onClick={() =>
          launchOverlay(
            t('regimen', 'Regimen'),
            <RegimenForm
              patientUuid={patientUuid}
              category={RegimenType[category]}
              onRegimen={onRegimen}
              lastRegimenEncounterUuid={lastRegimenEncounterUuid}
            />,
          )
        }
        style={{ cursor: 'pointer' }}
      />
    </>
  );
};

export default RegimenButton;
