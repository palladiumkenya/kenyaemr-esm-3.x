import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  AdmissionDate_UUID,
  PriorityOfAdmission_UUID,
  AdmissionWard_UUID,
  MchEncounterType_UUID,
  ModeOfDelivery_UUID,
  GestationalSize_UUID,
  BloodLoss_UUID,
  DeliveryForm_UUID,
  GivenVitaminK_UUID,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { OverflowMenu, OverflowMenuItem, DataTableSkeleton } from '@carbon/react';
import { clinicalEncounterUuid, useClinicalEncounter } from '../hooks/useClinicalEncounter';
import { ConfigObject } from '../config-schema';

import styles from '../in-patient/in-patient.scss';
import { useNeonatalSummery } from '../hooks/useNeonatalSummery';

interface NeonatalSummeryProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub?: any;
  launchPatientWorkspace?: Function;
}

const NeonatalSummeryr: React.FC<NeonatalSummeryProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const {
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();
  const headerTitle = t('clinicalEncounter', 'Clinical Encounter Details');
  const { encounters, isLoading, error, mutate, isValidating } = useNeonatalSummery(patientUuid, MchEncounterType_UUID);

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
  const tableHeader = [
    {
      key: 'encounterDate',
      header: t('encounterDate', 'Date of Delivery'),
    },
    {
      key: 'modeofDelivery',
      header: t('modeofDelivery', 'Mode of Delivery'),
    },
    {
      key: 'gestationalSize',
      header: t('gestationalSize', 'Gestational Size'),
    },
    {
      key: 'birthInjuriesTrauma',
      header: t('birthInjuriesTrauma', 'Birth Injuries/Trauma'),
    },
    {
      key: 'neonatalAbnormalities',
      header: t('neonatalAbnormalities', 'Neonatal Abnormalities'),
    },
    {
      key: 'bloodLoss',
      header: t('bloodLoss', 'Blood Transfusion Done'),
    },
    {
      key: 'neonatalProblems',
      header: t('neonatalProblems', 'Neonatal Problems'),
    },
    {
      key: 'babyGivenVitaminD',
      header: t('babyGivenVitaminD', 'Baby Given Vitamin K'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];
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
    return <DataTableSkeleton headers={tableHeader} aria-label="Neonatal Summary" />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('neonatalSummery', 'Neonatal Summary')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('neonatalSummery', 'Neonatal Summery')}
        headerTitle={t('neonatalSummery', 'Neonatal Summery')}
        launchForm={handleOpenOrEditNeonatalSummaryForm}
      />
    );
  }
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardtext}>
        <h6>Date of Delivery</h6>
        <br />
        <p>{tableRows[0]?.encounterDate}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Mode of Delivery</h6>
        <br />
        <p>{tableRows[0]?.modeofDelivery}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Gestational Size</h6>
        <br />
        <p>{tableRows[0]?.gestationalSize}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Birth Injuries/Trauma</h6>
        <br />
        <p>{tableRows[0]?.birthInjuriesTrauma}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Neonatal Abnormalities</h6>
        <br />
        <p>{tableRows[0]?.neonatalAbnormalities}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Blood Transfusion Done</h6>
        <br />
        <p>{tableRows[0]?.bloodLoss}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Neonatal Problems</h6>
        <br />
        <p>{tableRows[0]?.neonatalProblems}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Baby given Vitamin K</h6>
        <br />
        <p>{tableRows[0]?.babyGivenVitaminK}</p>
      </div>
      <div className={styles.cardtext}>
        <h6>Actions</h6>
        <br />
        {tableRows[0]?.actions}
      </div>
    </div>
  );
};
export default NeonatalSummeryr;
