import React from 'react';
import { ExtensionSlot, launchWorkspace, navigate, useConfig, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState, getPatientUuidFromUrl, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mutate } from 'swr';
import { ConfigObject } from '../../config-schema';

const AutopsyView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const { formsList } = useConfig<ConfigObject>();

  const handleLaunchAutopsyForm = (encounterUuid?: string) => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      patientUuid,
      encounterUuid: encounterUuid ?? '',
      formUuid: formsList?.autopsyFormUuid,
      mutateForm: () => {
        mutate(() => true, undefined, {
          revalidate: true,
        });
      },
    });
  };

  return (
    <div>
      <EmptyState
        displayText={'autopsy records'}
        headerTitle={t('autopsyRecords', 'Autopsy records')}
        launchForm={handleLaunchAutopsyForm}
      />
    </div>
  );
};

export default AutopsyView;
