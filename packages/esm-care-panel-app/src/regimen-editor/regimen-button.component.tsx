import React from 'react';
import { Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';

import { useTranslation } from 'react-i18next';

import { launchOverlay } from '../hooks/useOverlay';
import RegimenForm from './regimen-form.component';

interface RegimenButtonProps {
  patientUuid: string;
  category: string;
}

const RegimenButton: React.FC<RegimenButtonProps> = ({ category, patientUuid }) => {
  const { t } = useTranslation();
  return (
    <>
      <Edit
        onClick={() =>
          launchOverlay(t('regimen', 'Regimen'), <RegimenForm patientUuid={patientUuid} category={category} />)
        }
        style={{ cursor: 'pointer' }}
      />
    </>
  );
};

export default RegimenButton;
