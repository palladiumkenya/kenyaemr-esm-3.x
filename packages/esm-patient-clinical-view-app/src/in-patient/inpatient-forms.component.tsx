import { ComboButton, Dropdown, MenuItem } from '@carbon/react';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EmrApiConfigurationResponse,
  evaluateAsBoolean,
  launchWorkspace,
  useConfig,
  useVisit,
} from '@openmrs/esm-framework';
import { launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { BedManagementConfig } from '../config-schema';
import dayjs from 'dayjs';
import styles from './inpatient.scss';
type InpatientFormsProps = {
  patientUuid: string;
  patient: fhir.Patient;
  emrConfiguration: EmrApiConfigurationResponse;
};
const InpatientForms: FC<InpatientFormsProps> = ({ patientUuid, patient, emrConfiguration }) => {
  const { t } = useTranslation();
  const { inPatientForms } = useConfig<BedManagementConfig>();
  const { currentVisit } = useVisit(patientUuid);
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

  const isPatientAdmitted = useMemo(() => {
    const hasAdmissionEncounter = currentVisit.encounters.some(
      (encounter) => encounter.encounterType.uuid === emrConfiguration?.admissionEncounterType?.uuid,
    );
    const hasDischargeEncounter = currentVisit.encounters.some(
      (encounter) => encounter.encounterType.uuid === emrConfiguration?.exitFromInpatientEncounterType?.uuid,
    );
    return hasAdmissionEncounter && !hasDischargeEncounter;
  }, [emrConfiguration, currentVisit]);

  const handleLaunchForm = (form: { label: string; uuid: string }) => {
    if (!currentVisit) {
      return launchStartVisitPrompt();
    }
    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: form.label,
      mutateForm: () => {},
      formInfo: {
        encounterUuid: '',
        formUuid: form.uuid,
        additionalProps: {},
      },
    });
  };

  if (!isPatientAdmitted) {
    return null;
  }
  return (
    <div className={styles.inpatientFormsContainer}>
      <ComboButton size="sm" label={t('inPatientForms', 'In-Patient Forms')}>
        {filteredForms.map((form) => (
          <MenuItem key={form.uuid} onClick={() => handleLaunchForm(form)} label={form.label} />
        ))}
      </ComboButton>
    </div>
  );
};

export default InpatientForms;
