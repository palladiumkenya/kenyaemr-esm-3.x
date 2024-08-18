import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboButton, MenuItem, DataTableSkeleton } from '@carbon/react';
import { CardHeader, EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useConfig, useVisit } from '@openmrs/esm-framework';
import { BedManagementConfig } from '../config-schema';
import { usePatientEncounters } from './in-patient.resource';
import InPatientTable from './in-patient-table/in-patient-table.component';

type InPatientProps = {
  patientUuid: string;
};

const InPatient: React.FC<InPatientProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { inpatientVisitUuid } = useConfig<BedManagementConfig>();
  const { currentVisit } = useVisit(patientUuid);
  const { inPatientForms } = useConfig<BedManagementConfig>();
  const { encounters, isLoading, mutate } = usePatientEncounters(patientUuid);

  const hasInPatientVisit = currentVisit?.visitType.uuid === inpatientVisitUuid;

  const handleLaunchForm = (form: { label: string; uuid: string }) => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: form.label,
      mutateForm: () => mutate(),
      formInfo: {
        encounterUuid: '',
        formUuid: form.uuid,
        additionalProps: {},
      },
    });
  };

  if (!hasInPatientVisit) {
    return (
      <EmptyState
        displayText={t('inPatientVisitMessage', 'in-patient encounter found for current  {{visitType}} visit', {
          visitType: currentVisit?.visitType.display,
        })}
        headerTitle={t('inPatientView', 'In Patient View')}
      />
    );
  }

  return (
    <div>
      <CardHeader title={t('inPatient', 'In Patient')}>
        <ComboButton size="sm" label={t('inPatientForms', 'In-Patient Forms')}>
          {inPatientForms.map((form) => (
            <MenuItem key={form.uuid} onClick={() => handleLaunchForm(form)} label={form.label} />
          ))}
        </ComboButton>
      </CardHeader>
      <div>
        {isLoading && <DataTableSkeleton aria-label="encounters" />}
        {!isLoading && <InPatientTable tableRows={encounters} currentVisit={currentVisit} />}
      </div>
    </div>
  );
};

export default InPatient;
