import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import styles from './panels.scss';

const AttachmentView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();

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
