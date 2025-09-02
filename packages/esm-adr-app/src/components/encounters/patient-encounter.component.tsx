import React from 'react';
import { mutate } from 'swr';
import { InlineLoading } from '@carbon/react';
import { EmptyState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { useConfig } from '@openmrs/esm-framework';

import { usePatientAdrAssessmentEncounter } from './encounter.resource';
import AdrEncounter from './adr-encounter.component';
import { type ADRConfigObject } from '../../config-schema';
import styles from './encounter.scss';

type PatientEncounterProps = {
  patientUuid: string;
};

const PatientEncounter: React.FC<PatientEncounterProps> = ({ patientUuid }) => {
  const { adrAssessmentFormUuid } = useConfig<ADRConfigObject>();
  const { encounters, isLoading } = usePatientAdrAssessmentEncounter(patientUuid);
  const launchWorkspaceRequiringVisit = useLaunchWorkspaceRequiringVisit('patient-form-entry-workspace');

  const launchAdrAssessmentWorkspace = (encounterUuid: string = '') => {
    launchWorkspaceRequiringVisit({
      formInfo: {
        formUuid: adrAssessmentFormUuid,
        encounterUuid: encounterUuid,
      },
      mutateForm: () => {
        mutate((key) => typeof key === 'string' && key.startsWith(`/ws/rest/v1/encounter`), undefined, {
          revalidate: true,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description="Loading..." />
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState displayText="ADR Encounter" headerTitle="ADR Encounter" launchForm={launchAdrAssessmentWorkspace} />
      </div>
    );
  }

  return <AdrEncounter encounters={encounters} />;
};

export default PatientEncounter;
