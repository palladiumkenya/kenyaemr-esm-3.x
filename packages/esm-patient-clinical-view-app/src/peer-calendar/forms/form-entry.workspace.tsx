import { DefaultWorkspaceProps, ExtensionSlot, useConnectivity, usePatient } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';

type FormEntryWorkspaceProps = DefaultWorkspaceProps & {
  formUuid?: string;
  patientUuid?: string;
  encounterUuid?: string;
};

const FormEntryWorkspace: React.FC<FormEntryWorkspaceProps> = (props) => {
  const { formUuid, patientUuid, encounterUuid } = props;
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
    }),
    [patient, patientUuid, encounterUuid, formUuid, isOnline, props],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <ExtensionSlot name="form-widget-slot" state={state} />;
};

export default FormEntryWorkspace;
