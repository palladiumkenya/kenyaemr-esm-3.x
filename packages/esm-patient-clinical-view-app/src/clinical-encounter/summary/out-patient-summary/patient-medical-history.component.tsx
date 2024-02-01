import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  Surgical_History_UUID,
  Accident_Trauma_UUID,
  Blood_Transfusion_UUID,
  Chronic_Disease_UUID,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { useClinicalEncounter } from '../../../hooks/useClinicalEncounter';
import { ConfigObject } from '../../../config-schema';
import SummaryCard from '../summary-card.component';
import capitalize from 'lodash-es/capitalize';

import styles from './../../out-patient-department/out-patient.scss';
interface OutPatientMedicalHistoryProps {
  patientUuid: string;
}

const OutPatientMedicalHistory: React.FC<OutPatientMedicalHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const {
    clinicalEncounterUuid,
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();
  const { encounters, isLoading, error, mutate, isValidating } = useClinicalEncounter(
    patientUuid,
    clinicalEncounterUuid,
  );
  const handleOpenOrEditClinicalEncounterForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Medical History',
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
      surgicalHistory: getObsFromEncounter(encounter, Surgical_History_UUID),
      bloodTransfusion: getObsFromEncounter(encounter, Blood_Transfusion_UUID),
      accidentOrTrauma: getObsFromEncounter(encounter, Accident_Trauma_UUID),
      finalDiagnosis: encounter.diagnoses.length > 0 ? encounter.diagnoses[0].diagnosis.coded.display : '--',
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
    return <ErrorState error={error} headerTitle={t('medicalHistory', 'Medical History')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('clinicalEncounter', 'Clinical Encounter')}
        headerTitle={t('medicalHistory', 'Medical History')}
        launchForm={handleOpenOrEditClinicalEncounterForm}
      />
    );
  }
  return (
    <div className={styles.cardContainer}>
      {tableRows.map((row, index) => (
        <React.Fragment key={index}>
          <SummaryCard title={t('encounterDate', 'Encounter Date')} value={row?.encounterDate} />
          <SummaryCard title={t('surgicalHistory', 'Surgical History')} value={row?.surgicalHistory} />
          <SummaryCard title={t('bloodTransfusion', 'Blood Transfusion')} value={row?.bloodTransfusion} />
          <SummaryCard title={t('accidentOrTrauma', 'Accident/Trauma')} value={row?.accidentOrTrauma} />
          <SummaryCard title={t('finalDiagnosis', 'Final Diagnosis')} value={row?.finalDiagnosis} />
        </React.Fragment>
      ))}
    </div>
  );
};
export default OutPatientMedicalHistory;
