import React from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { AdmissionDate_UUID, PriorityOfAdmission_UUID, AdmissionWard_UUID } from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { ConfigObject } from '../../../config-schema';
import { useSurgicalSummery } from '../../../hooks/useSurgicalSummery';
import SummaryCard from '../summary-card.component';

import styles from '../../in-patient-department/in-patient.scss';

interface SurgicalSummeryProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub?: any;
  launchPatientWorkspace?: Function;
}

const ClinicalEncounter: React.FC<SurgicalSummeryProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const {
    formsList: { clinicalEncounterFormUuid },
    clinicalEncounterUuid,
  } = useConfig<ConfigObject>();

  const { encounters, isLoading, error, mutate } = useSurgicalSummery(patientUuid, clinicalEncounterUuid);
  const handleOpenOrEditClinicalEncounterForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Clinical Encounter',
      mutateForm: mutate,
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid: clinicalEncounterFormUuid,
        patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
      },
    });
  };
  const formattedEncounters = encounters.map((encounter, index) => {
    return {
      encounterDate: formatDate(new Date(encounter.encounterDatetime)),
      admissionDate:
        getObsFromEncounter(encounter, AdmissionDate_UUID) == '--' ||
        getObsFromEncounter(encounter, AdmissionDate_UUID) == null
          ? formatDate(parseDate(encounter.encounterDatetime))
          : formatDate(parseDate(getObsFromEncounter(encounter, AdmissionDate_UUID))),
      primaryDiagnosis: encounter.diagnoses.length > 0 ? encounter.diagnoses[0].diagnosis.coded.display : '--',
      priorityOfAdmission: getObsFromEncounter(encounter, PriorityOfAdmission_UUID),
      admittingDoctor: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
      admissionWard: getObsFromEncounter(encounter, AdmissionWard_UUID),
      actions: (
        <OverflowMenu aria-label="overflow-menu" flipped="false">
          <OverflowMenuItem
            onClick={() => handleOpenOrEditClinicalEncounterForm(encounter.uuid)}
            itemText={t('edit', 'Edit')}
          />
          <OverflowMenuItem itemText={t('delete', 'Delete')} isDelete />
        </OverflowMenu>
      ),
    };
  });
  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('clinicalEncounter', 'Clinical Encounter')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('clinicalEncounter', 'Clinical Encounter')}
        headerTitle={t('clinicalEncounter', 'Clinical Encounter')}
        launchForm={handleOpenOrEditClinicalEncounterForm}
      />
    );
  }
  return (
    <div className={styles.cardContainer}>
      <SummaryCard title={t('dateOfSurgery', 'Date of Surgery')} value={formattedEncounters[0]?.encounterDate} />
      <SummaryCard title={t('typeOfSurgery', 'Type of Surgery')} value={formattedEncounters[0]?.primaryDiagnosis} />
      <SummaryCard
        title={t('postOperativeComplications', 'Post Operative Complications')}
        value={formattedEncounters[0]?.admissionDate}
      />
      <SummaryCard
        title={t('postOperativeDiagnosis', 'Post Operative Diagnosis')}
        value={formattedEncounters[0]?.priorityOfAdmission}
      />
      <SummaryCard title={t('operatingDoctor', 'Operating Doctor')} value={formattedEncounters[0]?.admittingDoctor} />
    </div>
  );
};
export default ClinicalEncounter;
