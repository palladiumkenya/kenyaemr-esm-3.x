import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EncounterList, EncounterListColumn } from '../../../../encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../../../../encounter-list/encounter-list-utils';
import {
  ancHivResultConcept,
  artInitiationConcept,
  birthCountConcept,
  deliveryOutcomeConcept,
  hivTestAtMaternityResults,
  hivTestResultConcept,
  placeOfDeliveryConcept,
  visitDateConcept,
} from '../../../constants';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';

interface LabourDeliveryListProps {
  patientUuid: string;
}

const LabourDeliveryList: React.FC<LabourDeliveryListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('labourAndDelivery', 'Labour and Delivery');
  const LNDEncounterTypeUUID = useConfig().encounterTypes.mchMotherConsultation;
  const LNDEncounterFormUUID = useConfig().formsList.labourAndDelivery;

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'deliveryDate',
        header: t('deliveryDate', 'Delivery Date'),
        getValue: (encounter) => {
          return formatDate(parseDate(encounter.encounterDatetime));
        },
      },
      {
        key: 'deliveryOutcome',
        header: t('deliveryOutcome', 'Delivery Outcome'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, deliveryOutcomeConcept);
        },
      },
      {
        key: 'hivTestResults',
        header: t('hivTestResults', 'HIV Test Results'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, hivTestResultConcept);
        },
      },
      {
        key: 'testingAtMaternity',
        header: t('testingAtMaternity', 'HIV test at maternity'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, hivTestAtMaternityResults);
        },
      },
      {
        key: 'placeOfDelivery',
        header: t('placeOfDelivery', 'Place of Delivery'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, placeOfDeliveryConcept);
        },
      },
      {
        key: 'actions',
        header: t('actions', 'Actions'),
        getValue: (encounter) => [
          {
            form: { name: 'Labour & Delivery Form', package: 'maternal_health' },
            encounterUuid: encounter.uuid,
            intent: '*',
            label: t('viewDetails', 'View Details'),
            mode: 'view',
          },
          {
            form: { name: 'Labour & Delivery Form', package: 'maternal_health' },
            encounterUuid: encounter.uuid,
            intent: '*',
            label: t('editForm', 'Edit Form'),
            mode: 'edit',
          },
        ],
      },
    ],
    [t],
  );

  return (
    <EncounterList
      patientUuid={patientUuid}
      encounterType={LNDEncounterTypeUUID}
      formList={[{ name: 'Labour & Delivery Form' }]}
      columns={columns}
      description={headerTitle}
      headerTitle={headerTitle}
      launchOptions={{
        displayText: t('add', 'Add'),
        moduleName: 'MCH Clinical View',
      }}
      filter={(encounter) => {
        return encounter.form.uuid == LNDEncounterFormUUID;
      }}
    />
  );
};

export default LabourDeliveryList;
