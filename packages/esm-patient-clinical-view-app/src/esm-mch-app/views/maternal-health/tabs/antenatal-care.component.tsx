import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EncounterList, EncounterListColumn } from '../../../../encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../../../../encounter-list/encounter-list-utils';
import {
  artInitiationConcept,
  eDDConcept,
  followUpDateConcept,
  hivTestResultConcept,
  ancVisitNumberConcept,
  visitDateConcept,
  vLResultsConcept,
  partnerHivStatus,
} from '../../../constants';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';

interface AntenatalCareListProps {
  patientUuid: string;
}

const AntenatalCareList: React.FC<AntenatalCareListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('antenatalCare', 'Antenatal Care');
  const ANCEncounterTypeUUID = useConfig().encounterTypes.mchMotherConsultation;
  const ANCEncounterFormUUID = useConfig().formsList.antenatal;

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'visitDate',
        header: t('visitDate', 'Visit Date'),
        getValue: (encounter) => {
          return formatDate(parseDate(encounter.encounterDatetime));
        },
      },
      {
        key: 'ancVisitNumber',
        header: t('ancVisitNumber', 'ANC Visit Number'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, ancVisitNumberConcept);
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
        key: 'partnerStatus',
        header: t('partnerStatus', 'HIV status of partner)'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, partnerHivStatus);
        },
      },
      {
        key: 'followUpDate',
        header: t('followUpDate', 'Next follow-up date'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, followUpDateConcept, true);
        },
      },
      {
        key: 'facility',
        header: t('facility', 'Facility'),
        getValue: (encounter) => {
          return encounter.location.name;
        },
      },
      {
        key: 'actions',
        header: t('actions', 'Actions'),
        getValue: (encounter) => [
          {
            form: { name: 'Antenatal Form', package: 'maternal_health' },
            encounterUuid: encounter.uuid,
            intent: '*',
            label: t('viewDetails', 'View Details'),
            mode: 'view',
          },
          {
            form: { name: 'Antenatal Form', package: 'maternal_health' },
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
      encounterType={ANCEncounterTypeUUID}
      formList={[{ name: 'Antenatal Form' }]}
      columns={columns}
      description={headerTitle}
      headerTitle={headerTitle}
      launchOptions={{
        displayText: t('add', 'Add'),
        moduleName: 'MCH Clinical View',
      }}
      filter={(encounter) => {
        return encounter.form.uuid == ANCEncounterFormUUID;
      }}
    />
  );
};

export default AntenatalCareList;
