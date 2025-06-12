import { ActionMenuButton, launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Exit } from '@carbon/react/icons';

const DischargeIcon = (props) => <Exit {...props} />;

export default function PatientDischargeSideRailIcon() {
  const { t } = useTranslation();
  const handler = () => {
    launchWorkspace('patient-care-discharge-workspace');
  };

  return (
    <ActionMenuButton
      getIcon={DischargeIcon}
      label={t('discharge', 'Discharge')}
      iconDescription={t('discharge', 'Discharge')}
      handler={handler}
      type="ward-patient-discharge"
    />
  );
}
