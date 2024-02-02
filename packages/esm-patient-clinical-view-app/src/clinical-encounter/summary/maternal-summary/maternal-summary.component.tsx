import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, DataTableSkeleton } from '@carbon/react';
import { useClinicalEncounter } from '../../../hooks/useClinicalEncounter';
import { ConfigObject } from '../../../config-schema';
import SummaryCard from '../summary-card.component';

import styles from '../../dashboard/in-patient.scss';

interface MaternalSummaryProps {
  patientUuid: string;
}

const MaternalSummary: React.FC<MaternalSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const {
    clinicalEncounterUuid,
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();
  const { encounters, isLoading, error, mutate, isValidating } = useClinicalEncounter(
    patientUuid,
    clinicalEncounterUuid,
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
      <SummaryCard title={t('bloodGroup', 'Blood Group')} value={tableRows[0]?.bloodGroup} />
      <SummaryCard title={t('foetalPresentation', 'Foetal Presentation')} value={tableRows[0]?.foetalPresentation} />
      <SummaryCard title={t('maternalCondition', 'Maternal Condition')} value={tableRows[0]?.maternalCondition} />
    </div>
  );
};
export default MaternalSummary;
