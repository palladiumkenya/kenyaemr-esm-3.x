import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, InlineLoading } from '@carbon/react';
import { useClinicalEncounter } from '../../../hooks/useClinicalEncounter';
import { ConfigObject } from '../../../config-schema';
import SummaryCard from '../summary-card.component';

import styles from '../../in-patient-department/in-patient.scss';

interface InPatientSummaryProps {
  patientUuid: string;
}

const InPatientSummary: React.FC<InPatientSummaryProps> = ({ patientUuid }) => {
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
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('inPatientSummary', 'In Patient Summary')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('inPatientSummary', 'In Patient Summary')}
        headerTitle={t('inPatientSummary', 'In Patient Summary')}
        launchForm={handleOpenOrEditMaternalForm}
      />
    );
  }
  return (
    <>
      <div className={styles.cardContainer}>
        <SummaryCard title="Diagnosis on Admission" value={tableRows[0]?.bloodGroup} />
        <SummaryCard title={t('therapiesPrescribed', 'Therapies Prescribed')} value={tableRows[0]?.maternalCondition} />
        <SummaryCard
          title={t('recommendedProcedure', 'Recommended Procedure')}
          value={tableRows[0]?.maternalCondition}
        />
        <SummaryCard title={t('feedingOrders', 'Feeding Orders')} value={tableRows[0]?.maternalCondition} />
      </div>
      <div className={styles.cardContainer}>
        <SummaryCard title={t('referrals', 'Referrals')} value={tableRows[0]?.maternalCondition} />
        <SummaryCard title={t('dischargeDate', 'Discharge Date')} value={tableRows[0]?.maternalCondition} />
        <SummaryCard
          title={t('finalDischargeDiagnosis', 'Final Discharge Diagnosis')}
          value={tableRows[0]?.maternalCondition}
        />
        <SummaryCard title={t('statusAtDischarge', 'Status at Discharge')} value={tableRows[0]?.maternalCondition} />
        <SummaryCard title={t('followUpDate', 'Follow Up Date')} value={tableRows[0]?.maternalCondition} />
      </div>
      <div className={styles.cardContainer}>
        <SummaryCard title={t('dischargingDoctor', 'Discharging Doctor')} value={tableRows[0]?.maternalCondition} />
        <SummaryCard title={t('actions', 'Actions')} value={tableRows[0]?.maternalCondition} />
      </div>
    </>
  );
};
export default InPatientSummary;
