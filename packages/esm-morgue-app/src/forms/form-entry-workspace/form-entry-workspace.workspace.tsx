import { InlineLoading } from '@carbon/react';
import { DefaultWorkspaceProps, ExtensionSlot, useConnectivity, usePatient } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';

type FormEntryWorkspaceProps = DefaultWorkspaceProps & {
  formUuid?: string;
  patientUuid?: string;
  encounterUuid?: string;
  mutateForm: () => void;
};

const FormEntryWorkspace: React.FC<FormEntryWorkspaceProps> = (props) => {
  const { formUuid, patientUuid, encounterUuid, mutateForm, closeWorkspace, closeWorkspaceWithSavedChanges } = props;
  const { patient, isLoading } = usePatient(patientUuid);
  const isOnline = useConnectivity();
  const state = useMemo(
    () => ({
      ...props,
      view: 'form',
      formUuid: formUuid ?? null,
      visitUuid: '',
      visitTypeUuid: '',
      visitStartDatetime: null,
      visitStopDatetime: null,
      isOffline: !isOnline,
      patientUuid: patientUuid ?? null,
      patient,
      encounterUuid: encounterUuid ?? null,
      closeWorkspace: () => {
        typeof mutateForm === 'function' && mutateForm();
        closeWorkspace();
      },
      closeWorkspaceWithSavedChanges: () => {
        typeof mutateForm === 'function' && mutateForm();
        closeWorkspaceWithSavedChanges();
      },
    }),
    [
      patient,
      patientUuid,
      encounterUuid,
      formUuid,
      isOnline,
      props,
      closeWorkspace,
      closeWorkspaceWithSavedChanges,
      mutateForm,
    ],
  );

  if (isLoading) {
    return (
      <div>
        <InlineLoading status="active" iconDescription="Loading" description="Loading form..." />
      </div>
    );
  }

  return <ExtensionSlot name="form-widget-slot" state={state} />;
};

export default FormEntryWorkspace;
