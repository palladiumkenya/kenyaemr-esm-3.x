import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  AdmissionDate_UUID,
  PriorityOfAdmission_UUID,
  AdmissionWard_UUID,
  clinicalEncounterRepresentation,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, DataTableSkeleton } from '@carbon/react';
import { ConfigObject } from '../config-schema';

import styles from '../in-patient/in-patient.scss';
import { useSurgicalSummery } from '../hooks/useSurgicalSummery';

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
  } = useConfig<ConfigObject>();
  const config = useConfig() as ConfigObject;
  const headerTitle = t('clinicalEncounter', 'Clinical Encounter Details');

  const { encounters, isLoading, error, mutate, isValidating } = useSurgicalSummery(
    patientUuid,
    config.clinicalEncounterUuid,
  );
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
  const tableHeader = [
    {
      key: 'admissionDate',
      header: t('admissionDate', 'Date of Surgery'),
    },
    {
      key: 'primaryDiagnosis',
      header: t('primaryDiagnosis', 'Type of Surgery'),
    },
    {
      key: 'priorityOfAdmission',
      header: t('priorityOfAdmission', 'Post Operative Complications'),
    },
    {
      key: 'encounterDate',
      header: t('encounterDate', 'Post Operative Diagnosis'),
    },
    {
      key: 'admittingDoctor',
      header: t('admittingDoctor', 'Operating Doctor'),
    },

    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];
  const tableRows = encounters.map((encounter, index) => {
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
    return <DataTableSkeleton headers={tableHeader} aria-label="Cliical Encounter" />;
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
      <div className={styles.cardtext}>
        <h6>Date of Surgery</h6>
        <br />
        <p>{tableRows[0]?.encounterDate}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Type of Surgery</h6>
        <br />
        <p>{tableRows[0]?.primaryDiagnosis}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Postoperative Complications</h6>
        <br />
        <p>{tableRows[0]?.admissionDate}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Postoperative Diagnosis</h6>
        <br />
        <p>{tableRows[0]?.priorityOfAdmission}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Operating Doctor</h6>
        <br />
        <p>{tableRows[0]?.admittingDoctor}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Actions</h6>
        <br />
        {tableRows[0]?.actions}
      </div>
    </div>
  );
};
export default ClinicalEncounter;
