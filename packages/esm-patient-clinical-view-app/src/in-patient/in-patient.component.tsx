import React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboButton, MenuItem, DataTableSkeleton } from '@carbon/react';
import { CardHeader, EmptyState, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { useConfig, useVisit, evaluateAsBoolean, launchWorkspace } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { BedManagementConfig } from '../config-schema';
import { usePatientEncounters } from './in-patient.resource';
import InPatientTable from './in-patient-table/in-patient-table.component';

type InPatientProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const InPatient: React.FC<InPatientProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const { inpatientVisitUuid } = useConfig<BedManagementConfig>();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { inPatientForms } = useConfig<BedManagementConfig>();
  const { encounters, isLoading, mutate } = usePatientEncounters(patientUuid);

  const hasInPatientVisit = currentVisit?.visitType.uuid === inpatientVisitUuid;
  const filteredForms = inPatientForms.filter((form) => {
    if (!form.hideExpression) {
      return true;
    }
    const age = dayjs().diff(dayjs(patient.birthDate), 'year');
    const ageInDays = dayjs().diff(dayjs(patient.birthDate), 'day');
    const ageInMonths = dayjs().diff(dayjs(patient.birthDate), 'month');
    const gender = patient.gender;
    const hide = form.hideExpression
      ? evaluateAsBoolean(form.hideExpression, { age, gender, ageInDays, ageInMonths })
      : false;
    return hide;
  });

  const handleLaunchForm = (form: { label: string; uuid: string }) => {
    launchWorkspace('patient-form-entry-workspace', {
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
          {filteredForms.map((form) => (
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
