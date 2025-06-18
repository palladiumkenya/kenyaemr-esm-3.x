import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, InlineNotification } from '@carbon/react';
import {
  DefaultWorkspaceProps,
  Encounter,
  ExtensionSlot,
  useEmrConfiguration,
  usePatient,
} from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { usePatientDischarge } from './patient-discharge.resource';
import { WardPatient } from '../types';

const IN_PATIENT_DISCHARGE_FORM_UUID = '98a781d2-b777-4756-b4c9-c9b0deb3483c';

type PatientDischargeWorkspaceProps = DefaultWorkspaceProps & {
  readonly patientUuid: string;
  readonly wardPatient: WardPatient;
};

export function PatientDischargeWorkspace(props: PatientDischargeWorkspaceProps) {
  const { t } = useTranslation();
  const { patientUuid, closeWorkspace, closeWorkspaceWithSavedChanges, wardPatient, promptBeforeClosing } = props;

  const { isLoading: isLoadingVisit, currentVisit, error: visitError } = useVisitOrOfflineVisit(patientUuid);
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();

  const { handleDischarge } = usePatientDischarge();

  const encounterUuid = useMemo(() => currentVisit?.encounters?.[0]?.uuid ?? null, [currentVisit?.encounters]);

  const state = useMemo<Record<string, unknown>>(
    () => ({
      view: 'form',
      formUuid: IN_PATIENT_DISCHARGE_FORM_UUID,
      visitUuid: currentVisit?.uuid ?? null,
      visitTypeUuid: currentVisit?.visitType?.uuid ?? null,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid,
      closeWorkspaceWithSavedChanges,
      closeWorkspace,
      promptBeforeClosing,
      handlePostResponse: (encounter: Encounter) =>
        handleDischarge(encounter, wardPatient, emrConfiguration as Record<string, unknown>, currentVisit),
    }),
    [
      patientUuid,
      currentVisit,
      encounterUuid,
      patient,
      closeWorkspace,
      promptBeforeClosing,
      emrConfiguration,
      closeWorkspaceWithSavedChanges,
      handleDischarge,
    ],
  );

  const isLoading = isLoadingVisit || isLoadingPatient || isLoadingEmrConfiguration;
  const error = visitError || patientError || errorFetchingEmrConfiguration;

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading')} iconDescription={t('loading', 'Loading data...')} />;
  }

  if (error) {
    return (
      <InlineNotification
        aria-label={t('error', 'Error')}
        kind="error"
        onClose={() => {}}
        onCloseButtonClick={() => {}}
        statusIconDescription="notification"
        subtitle={t('errorLoadingPatientWorkspace', 'Error loading patient workspace {{errorMessage}}', {
          errorMessage: error?.message,
        })}
        title={t('error', 'Error')}
      />
    );
  }

  return (
    <div>
      <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
      {patient && <ExtensionSlot name="form-widget-slot" state={state} />}
    </div>
  );
}

export default PatientDischargeWorkspace;
