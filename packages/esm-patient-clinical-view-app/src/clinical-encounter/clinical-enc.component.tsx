import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import { AdmissionDate_UUID, PriorityOfAdmission_UUID, AdmissionWard_UUID } from '../utils/constants';
import { getObsFromEncounter } from '../ui/encounter-list/encounter-list-utils';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { ConfigObject } from '../config-schema';
import SummaryCard from './summary/summary-card.component';
import capitalize from 'lodash-es/capitalize';

import styles from './dashboard/in-patient.scss';
import { OpenmrsEncounter } from '../types';
import { KeyedMutator } from 'swr';
interface ClinicalEncounterProps {
  patientUuid: string;
  encounters: OpenmrsEncounter[];
  isLoading: boolean;
  error: Error;
  isValidating: boolean;
  mutate: KeyedMutator<any>;
}

const ClinicalEncounter: React.FC<ClinicalEncounterProps> = ({
  patientUuid,
  encounters,
  isLoading,
  error,
  mutate,
  isValidating,
}) => {
  const { t } = useTranslation();
  const {
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();
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
  const tableRows = encounters?.map((encounter, index) => {
    return {
      id: `${encounter.uuid}`,
      encounterDate: formatDate(new Date(encounter.encounterDatetime)),
      admissionDate:
        getObsFromEncounter(encounter, AdmissionDate_UUID) == '--' ||
        getObsFromEncounter(encounter, AdmissionDate_UUID) == null
          ? formatDate(parseDate(encounter.encounterDatetime))
          : formatDate(parseDate(getObsFromEncounter(encounter, AdmissionDate_UUID))),
      primaryDiagnosis: encounter.diagnoses.length > 0 ? encounter.diagnoses[0].diagnosis.coded.display : '--',
      priorityOfAdmission: getObsFromEncounter(encounter, PriorityOfAdmission_UUID),
      admittingDoctor: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].provider.name : '',
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
      <SummaryCard title={t('encounterDate', 'Encounter Date')} value={tableRows[0]?.encounterDate} />
      <SummaryCard title={t('primaryDiagnosis', 'Primary Diagnosis')} value={tableRows[0]?.primaryDiagnosis} />
      <SummaryCard title={t('admissionDate', 'Admission Date')} value={tableRows[0]?.admissionDate} />
      <SummaryCard
        title={t('priorityOfAdmission', 'Priority Of Admission')}
        value={tableRows[0]?.priorityOfAdmission}
      />
      <SummaryCard title={t('admittingDoctor', 'Admitting Doctor')} value={capitalize(tableRows[0]?.admittingDoctor)} />
      <SummaryCard title={t('admissionWard', 'Admission Ward')} value={tableRows[0]?.admissionWard} />
    </div>
  );
};
export default ClinicalEncounter;
