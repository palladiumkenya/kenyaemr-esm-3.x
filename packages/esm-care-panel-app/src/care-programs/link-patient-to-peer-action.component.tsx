import React, { FC } from 'react';
import { usePatientActivePeerEducator } from './kvp-program-actions.resource';
import { useTranslation } from 'react-i18next';
import { InlineLoading, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace, useConfig, Visit } from '@openmrs/esm-framework';
import { CarePanelConfig } from '../config-schema';
import { launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';

type KvpLinkPatientToPeerEducatorProps = {
  patientUuid: string;
  form: CarePanelConfig['careProgramForms'][0]['forms'][0];
  visit?: Visit;
  mutate?: () => void;
};
const KvpLinkPatientToPeerEducator: FC<KvpLinkPatientToPeerEducatorProps> = ({
  patientUuid,
  form,
  visit: currentVisit,
  mutate,
}) => {
  const { activePeer, error, isLoading } = usePatientActivePeerEducator(patientUuid);
  const { hideFilledProgramForm } = useConfig<CarePanelConfig>();
  const { t } = useTranslation();
  const formEncounter = currentVisit?.encounters?.find((en) => en.form?.uuid === form.formUuId);

  if (isLoading) {
    return <InlineLoading />;
  }

  if (!activePeer.length) {
    return (
      <OverflowMenuItem
        itemText={t('linkToPeerEducator', 'Link to peer Educator')}
        onClick={() => {
          launchWorkspace('kvp-peer-linkage-form-workspace', {
            workspaceTitle: t('linkPatientToPeerEducator', 'Link Patient to Peer Educator'),
            patientUuid,
          });
        }}
      />
    );
  }

  if (hideFilledProgramForm && formEncounter) {
    return null;
  }

  return (
    <OverflowMenuItem
      key={form.formUuId}
      itemText={form.formName}
      onClick={() => {
        if (currentVisit) {
          return launchWorkspace('patient-form-entry-workspace', {
            workspaceTitle: form.formName,
            mutateForm: mutate,
            formInfo: {
              encounterUuid: formEncounter?.uuid ?? '',
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

export default KvpLinkPatientToPeerEducator;
