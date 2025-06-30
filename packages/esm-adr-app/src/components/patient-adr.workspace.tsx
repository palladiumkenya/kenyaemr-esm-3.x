import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, InlineNotification } from '@carbon/react';
import { DefaultWorkspaceProps, ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';

type encounter = {
  formUuid: string;
  encounterDatetime: string;
  encounterType: string;
  encounterUuid: string;
  visitUuid: string;
  patientUuid: string;
  visitTypeUuid: string;
};

type PatientAdrWorkspaceProps = DefaultWorkspaceProps & {
  encounter?: encounter;
};

export function PatientAdrWorkspace(props: PatientAdrWorkspaceProps) {
  const { t } = useTranslation();
  const { closeWorkspace, closeWorkspaceWithSavedChanges, promptBeforeClosing, encounter } = props;
  const { formUuid, encounterUuid, visitUuid, patientUuid, visitTypeUuid } = encounter || {};
  const { isLoading: isLoadingVisit, currentVisit, error: visitError } = useVisitOrOfflineVisit(patientUuid);
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);
  const state = useMemo<Record<string, unknown>>(
    () => ({
      view: 'form',
      formUuid: formUuid ?? null,
      visitUuid: visitUuid ?? null,
      visitTypeUuid: visitTypeUuid ?? null,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: encounterUuid ?? null,
      closeWorkspaceWithSavedChanges,
      closeWorkspace,
      promptBeforeClosing,
    }),
    [
      patientUuid,
      encounterUuid,
      patient,
      closeWorkspace,
      promptBeforeClosing,
      formUuid,
      visitUuid,
      visitTypeUuid,
      closeWorkspaceWithSavedChanges,
    ],
  );

  const isLoading = isLoadingVisit || isLoadingPatient;
  const error = visitError || patientError;

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

  return <div>{patient && <ExtensionSlot name="form-widget-slot" state={state} />}</div>;
}

export default PatientAdrWorkspace;
