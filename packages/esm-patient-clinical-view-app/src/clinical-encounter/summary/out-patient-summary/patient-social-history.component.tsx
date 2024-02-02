import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  Alcohol_Use_UUID,
  Alcohol_Use_Duration_UUID,
  Smoking_UUID,
  Smoking_Duration_UUID,
  Other_Substance_Abuse_UUID,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { useClinicalEncounter } from '../../../hooks/useClinicalEncounter';
import { ConfigObject } from '../../../config-schema';
import SummaryCard from '../summary-card.component';
import capitalize from 'lodash-es/capitalize';
import styles from './../../out-patient-department/out-patient.scss';
interface OutPatientSocialHistoryProps {
  patientUuid: string;
}

const OutPatientSocialHistory: React.FC<OutPatientSocialHistoryProps> = ({ patientUuid }) => {
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
      workspaceTitle: 'Social History',
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
      alcoholUse: getObsFromEncounter(encounter, Alcohol_Use_UUID),
      alcoholUseDuration: getObsFromEncounter(encounter, Alcohol_Use_Duration_UUID),
      smoking: getObsFromEncounter(encounter, Smoking_UUID),
      smokingDuration: getObsFromEncounter(encounter, Smoking_Duration_UUID),
      otherSubstanceAbuse: getObsFromEncounter(encounter, Other_Substance_Abuse_UUID),
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
    return <ErrorState error={error} headerTitle={t('socialHistory', 'Social History')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('clinicalEncounter', 'Clinical Encounter')}
        headerTitle={t('socialHistory', 'Social History')}
        launchForm={handleOpenOrEditClinicalEncounterForm}
      />
    );
  }
  return (
    <div className={styles.cardContainer}>
      {tableRows.map((row, index) => (
        <React.Fragment key={index}>
          <SummaryCard title={t('encounterDate', 'Date')} value={row?.encounterDate} />
          <SummaryCard title={t('alcoholUse', 'Alcohol Use')} value={row?.alcoholUse} />
          <SummaryCard title={t('alcoholUseDuration', 'Duration')} value={row?.alcoholUseDuration} />
          <SummaryCard title={t('smoking', 'Tobacco Use')} value={row?.smoking} />
          <SummaryCard title={t('smokingDuration', 'Duration')} value={row?.smokingDuration} />
          <SummaryCard title={t('otherSubstanceAbuse', 'Other Substance Use')} value={row?.otherSubstanceAbuse} />
        </React.Fragment>
      ))}
    </div>
  );
};
export default OutPatientSocialHistory;
