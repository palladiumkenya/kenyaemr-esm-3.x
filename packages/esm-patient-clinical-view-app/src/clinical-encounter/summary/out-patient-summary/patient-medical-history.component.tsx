import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import { SURGICAL_HISTORY_UUID, ACCIDENT_TRAUMA_UUID, BLOOD_TRANSFUSION_UUID } from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { useClinicalEncounter } from '../../../hooks/useClinicalEncounter';
import { ConfigObject } from '../../../config-schema';
import SummaryCard from '../summary-card.component';

import styles from './out-patient-summary.scss';
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
      surgicalHistory: getObsFromEncounter(encounter, SURGICAL_HISTORY_UUID),
      bloodTransfusion: getObsFromEncounter(encounter, BLOOD_TRANSFUSION_UUID),
      accidentOrTrauma: getObsFromEncounter(encounter, ACCIDENT_TRAUMA_UUID),
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
