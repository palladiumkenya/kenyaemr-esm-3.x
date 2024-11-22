import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import styles from './panels.scss';

const BillingHistoryView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  return <ExtensionSlot name="patient-chart-billing-dashboard-slot" state={{ patientUuid }} />;
};

export default BillingHistoryView;
