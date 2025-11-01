import { InlineLoading, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace, showSnackbar, useConfig, Visit } from '@openmrs/esm-framework';
import { launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CarePanelConfig } from '../config-schema';
import { useFormsFilled, usePatientFormEncounter } from './care-program.resource';
import KvpLinkPatientToPeerEducator from './link-patient-to-peer-action.component';

type ProgramFormOverflowMenuItemProps = {
  patientUuid: string;
  form: CarePanelConfig['careProgramForms'][0]['forms'][0];
  mutate?: () => void;
  visit?: Visit;
};

const ProgramFormOverflowMenuItem: FC<ProgramFormOverflowMenuItemProps> = ({
  form,
  patientUuid,
  mutate,
  visit: currentVisit,
}) => {
  const {
    formEncounters,
    error,
    isLoading,
    mutate: mutateFormEncounters,
  } = usePatientFormEncounter(patientUuid, form.formUuId);
  const { hideFilledProgramForm, peerCalendarOutreactForm } = useConfig<CarePanelConfig>();
  const { t } = useTranslation();
  const {
    error: formFilledError,
    formsFilled: areAllDependancyFormsFilled,
    isLoading: isLoadingDependancyStatus,
    mutate: mutateDependancyStatus,
  } = useFormsFilled(patientUuid, form.dependancies);

  const latestFormEncounter = useMemo(() => formEncounters.at(0)?.encounter?.uuid, [formEncounters]);
  // Show form if
  // 1. Form is not yet filled AND (Form Has no dependancies OR Form has dependancies that are all filled)
  // 2. Form is filled already AND hideFilledProgramForm is configured to false (else launch in edit mode)
  const showForm = useMemo(() => {
    // !latestFormEncounter -> current form is not yet filled
    if (!latestFormEncounter && (!form?.dependancies?.length || areAllDependancyFormsFilled)) {
      return true;
    }
    if (latestFormEncounter && !hideFilledProgramForm) {
      return true;
    }
    return false;
  }, [areAllDependancyFormsFilled, form?.dependancies?.length, hideFilledProgramForm, latestFormEncounter]);

  useEffect(() => {
    if (error || formFilledError) {
      showSnackbar({ kind: 'error', title: t('error', 'Error'), subtitle: (error ?? formFilledError)?.message });
    }
  }, [error, formFilledError, t]);

  if (isLoading || isLoadingDependancyStatus) {
    return <InlineLoading />;
  }

  if (!showForm) {
    return null;
  }

  if (form.formUuId === peerCalendarOutreactForm) {
    return (
      <KvpLinkPatientToPeerEducator
        form={form}
        patientUuid={patientUuid}
        visit={currentVisit}
        mutate={() => {
          mutate?.();
          mutateDependancyStatus();
          mutateFormEncounters();
        }}
      />
    );
  }

  return (
    <OverflowMenuItem
      key={form.formUuId}
      itemText={form.formName}
      onClick={() => {
        if (currentVisit) {
          return launchWorkspace('patient-form-entry-workspace', {
            workspaceTitle: form.formName,
            mutateForm: () => {
              mutate?.();
              mutateDependancyStatus();
              mutateFormEncounters();
            },
            formInfo: {
              encounterUuid: latestFormEncounter ?? '',
              formUuid: form.formUuId,
              // additionalProps: { enrollmenrDetails: careProgram.enrollmentDetails ?? {} },
            },
          });
        }
        launchStartVisitPrompt();
      }}
    />
  );
};

export default ProgramFormOverflowMenuItem;
