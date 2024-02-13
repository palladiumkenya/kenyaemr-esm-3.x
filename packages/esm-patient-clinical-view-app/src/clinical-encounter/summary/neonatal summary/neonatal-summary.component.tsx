import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';
import {
  MchEncounterType_UUID,
  ModeOfDelivery_UUID,
  GestationalSize_UUID,
  BloodLoss_UUID,
  DeliveryForm_UUID,
  GivenVitaminK_UUID,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { useNeonatalSummary } from '../../../hooks/useNeonatalSummary';
import SummaryCard from '../summary-card.component';

import styles from '../../dashboard/in-patient.scss';

interface NeonatalSummaryProps {
  patientUuid: string;
}

const NeonatalSummary: React.FC<NeonatalSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { encounters, isLoading, error, mutate } = useNeonatalSummary(patientUuid, MchEncounterType_UUID);

  const handleOpenOrEditNeonatalSummaryForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Neonatal Summary',
      mutateForm: mutate,
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid: DeliveryForm_UUID,
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
      deliveryDate: formatDate(new Date(encounter.encounterDatetime)),
      modeofDelivery: getObsFromEncounter(encounter, ModeOfDelivery_UUID),
      gestationalSize: getObsFromEncounter(encounter, GestationalSize_UUID),
      birthInjuriesTrauma: '--',
      neonatalAbnormalities: '--',
      bloodLoss: getObsFromEncounter(encounter, BloodLoss_UUID),
      neonatalProblems: '--',
      babyGivenVitaminK: getObsFromEncounter(encounter, GivenVitaminK_UUID),

      actions: (
        <OverflowMenu aria-label="overflow-menu" flipped="false">
          <OverflowMenuItem
            onClick={() => handleOpenOrEditNeonatalSummaryForm(encounter.uuid)}
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
    return <ErrorState error={error} headerTitle={t('neonatalSummary', 'Neonatal Summary')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('neonatalSummary', 'Neonatal Summary')}
        headerTitle={t('neonatalSummary', 'Neonatal Summary')}
        launchForm={handleOpenOrEditNeonatalSummaryForm}
      />
    );
  }
  return (
    <div className={styles.cardContainer}>
      <SummaryCard title={t('dateOfDelivery', 'Date of Delivery')} value={tableRows[0]?.encounterDate} />
      <SummaryCard title={t('modeOfDelivery', 'Mode of Delivery')} value={tableRows[0]?.modeofDelivery} />
      <SummaryCard title={t('gestationalSize', 'Gestational Size')} value={tableRows[0]?.gestationalSize} />
      <SummaryCard
        title={t('birthInjuriesTrauma', 'Birth Injuries/Trauma')}
        value={tableRows[0]?.birthInjuriesTrauma}
      />
      <SummaryCard
        title={t('neonatalAbnormalities', 'Neonatal Abnormalities')}
        value={tableRows[0]?.neonatalAbnormalities}
      />
      <SummaryCard title={t('bloodLoss', 'Blood Transfusion Done')} value={tableRows[0]?.bloodLoss} />
      <SummaryCard title={t('neonatalProblems', 'Neonatal Problems')} value={tableRows[0]?.neonatalProblems} />
      <SummaryCard title={t('babyGivenVitaminD', 'Baby Given Vitamin K')} value={tableRows[0]?.babyGivenVitaminK} />
    </div>
  );
};
export default NeonatalSummary;
