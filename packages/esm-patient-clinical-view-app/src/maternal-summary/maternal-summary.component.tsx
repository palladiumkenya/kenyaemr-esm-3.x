import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import { AdmissionDate_UUID, PriorityOfAdmission_UUID, AdmissionWard_UUID } from '../../../utils/constants';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, DataTableSkeleton } from '@carbon/react';
import { useClinicalEncounter } from '../hooks/useClinicalEncounter';
import { ConfigObject } from '../config-schema';

import styles from '../in-patient/in-patient.scss';

interface MaternalSummaryProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub?: any;
  launchPatientWorkspace?: Function;
}

const MaternalSummary: React.FC<MaternalSummaryProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const {
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();
  const config = useConfig() as ConfigObject;
  const headerTitle = t('clinicalEncounter', 'Clinical Encounter Details');
  const { encounters, isLoading, error, mutate, isValidating } = useClinicalEncounter(
    patientUuid,
    config.clinicalEncounterUuid,
  );
  const handleOpenOrEditMaternalForm = (encounterUUID = '') => {
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
      bloodGroup: '',
      foetalPresentation: '',
      maternalCondition: '',
      actions: (
        <OverflowMenu aria-label="overflow-menu" flipped="false">
          <OverflowMenuItem onClick={() => handleOpenOrEditMaternalForm(encounter.uuid)} itemText={t('edit', 'Edit')} />
          <OverflowMenuItem itemText={t('delete', 'Delete')} isDelete />
        </OverflowMenu>
      ),
    };
  });
  if (isLoading) {
    return <DataTableSkeleton aria-label="Maternal Summary" />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('maternalSummary', 'Maternal Summary')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('maternalSummary', 'Maternal Summary')}
        headerTitle={t('maternalSummary', 'Maternal Summary')}
        launchForm={handleOpenOrEditMaternalForm}
      />
    );
  }
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardtext}>
        <h6>Blood Group</h6>
        <br />
        <p>{tableRows[0]?.bloodGroup}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Foetal Presentation</h6>
        <br />
        <p>{tableRows[0]?.foetalPresentation}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Maternal Condition</h6>
        <br />
        <p>{tableRows[0]?.maternalCondition}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Actions</h6>
        <br />
        {tableRows[0]?.actions}
      </div>
    </div>
  );
};
export default MaternalSummary;
