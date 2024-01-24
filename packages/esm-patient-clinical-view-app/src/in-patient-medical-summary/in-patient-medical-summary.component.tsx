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

interface InPatientSummaryProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub?: any;
  launchPatientWorkspace?: Function;
}

const InPatientSummary: React.FC<InPatientSummaryProps> = ({ patientUuid, encounterTypeUuid }) => {
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
    return <DataTableSkeleton aria-label="In Patient Summary" />;
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
        <div className={styles.cardtext}>
          <h6>Diagnosis on Admission</h6>
          <br />
          <p>{tableRows[0]?.bloodGroup}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Chronic Illness</h6>
          <br />
          <p>{tableRows[0]?.foetalPresentation}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Therapies Prescribed</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Procedure Recommended</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Feeding Orders</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <div className={styles.cardtext}>
          <h6>Referrals</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Discharge Date</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Final Discharge Diagnosis</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Status at Discharge</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Follow Up Date</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <div className={styles.cardtext}>
          <h6>Discharging Doctor</h6>
          <br />
          <p>{tableRows[0]?.maternalCondition}</p>
        </div>
        <div className={styles.cardtext}>
          <h6>Actions</h6>
          <br />
          {tableRows[0]?.actions}
        </div>
      </div>
    </>
  );
};
export default InPatientSummary;
