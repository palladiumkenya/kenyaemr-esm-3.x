import React, { FC, PropsWithChildren } from 'react';
import { usePatientActiveCases } from './case-encounter-table.resource';
import { DataTableSkeleton } from '@carbon/react';
import { ErrorState, launchWorkspace } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

type PatientHasActiveCaseProps = PropsWithChildren<{ patientUuid: string }>;

const PatientHasActiveCase: FC<PatientHasActiveCaseProps> = ({ patientUuid, children }) => {
  const { activeCases, error, isLoading } = usePatientActiveCases(patientUuid);
  const { t } = useTranslation();
  const handleAddPatientCase = () => {
    launchWorkspace('add-patient-case-form', { workspaceTitle: 'Add Patient Case', patientUuid });
  };
  if (isLoading) {
    return <DataTableSkeleton />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('patientCases', 'Patient Cases')} />;
  }
  if (!activeCases?.length) {
    return (
      <EmptyState
        headerTitle={t('patientCases', 'Patient Cases')}
        displayText={t('patientActiveCase', 'Patient Active case')}
        launchForm={handleAddPatientCase}
      />
    );
  }
  return <>{children}</>;
};

export default PatientHasActiveCase;
