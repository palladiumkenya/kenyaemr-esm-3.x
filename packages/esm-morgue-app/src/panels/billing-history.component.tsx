import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';

const BillingHistoryView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  return (
    <div>
      <ExtensionSlot name="patient-chart-billing-dashboard-slot" state={{ patientUuid }} />
    </div>
  );
};

export default BillingHistoryView;
