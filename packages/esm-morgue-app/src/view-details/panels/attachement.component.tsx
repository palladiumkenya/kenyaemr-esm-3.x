import React from 'react';
import { useParams } from 'react-router-dom';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface RouteParams {
  patientUuid: string;
  [key: string]: string | undefined;
}

const AttachmentView: React.FC = () => {
  const { t } = useTranslation();
  const { patientUuid } = useParams<RouteParams>();

  if (!patientUuid) {
    return (
      <EmptyState
        displayText={t('noPatientSelected', 'No patient selected')}
        headerTitle={t('attachments', 'Attachments')}
      />
    );
  }

  return (
    <ExtensionSlot
      name="patient-chart-attachments-dashboard-slot"
      state={{
        patientUuid,
      }}
    />
  );
};

export default AttachmentView;
