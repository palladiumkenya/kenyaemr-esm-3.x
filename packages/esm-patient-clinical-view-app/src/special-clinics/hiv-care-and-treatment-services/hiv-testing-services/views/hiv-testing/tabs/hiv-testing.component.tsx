import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EncounterList, EncounterListColumn } from '../../../../../../ui/encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../../../../../../ui/encounter-list/encounter-list-utils';
import {
  testApproachConcept,
  testStrategyConcept,
  entryPointConcept,
  finalResultConcept,
  tbScreeeningConcept,
} from '../../../constants';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';
import { ConfigObject } from '../../../../../../config-schema';
import { hivTestingConceptMap } from '../hiv-testing-constants';

interface HivTestingEncountersListProps {
  patientUuid: string;
}

const HivTestingEncounters: React.FC<HivTestingEncountersListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('htsInitial', 'HTS Initial Test');

  const {
    encounterTypes: { hivTestingServices },
    formsList: { htsInitialTest, htsRetest },
  } = useConfig<ConfigObject>();

  const htsEncounterTypeUUID = hivTestingServices;
  const htsInitialEncounterFormUUID = htsInitialTest;

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'testDate',
        header: t('testDate', 'Test Date'),
        getValue: (encounter) => {
          return formatDate(parseDate(encounter.encounterDatetime));
        },
      },
      {
        key: 'htsTestType',
        header: t('htsTestType', 'Test type'),
        getValue: (encounter) => {
          return encounter.form.name;
        },
      },
      {
        key: 'testApproach',
        header: t('testApproach', 'Approach'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, testApproachConcept);
        },
      },
      {
        key: 'testStrategy',
        header: t('testStrategy', 'Strategy'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, testStrategyConcept);
        },
      },
      {
        key: 'testEntryPoint',
        header: t('testEntryPoint', 'Entry point'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, entryPointConcept);
        },
      },
      {
        key: 'htsResult',
        header: t('htsResult', 'Final result'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, finalResultConcept);
        },
      },
      {
        key: 'tbScreening',
        header: t('tbScreening', 'TB screening outcome'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, tbScreeeningConcept);
        },
      },
      {
        key: 'actions',
        header: t('actions', 'Actions'),
        getValue: (encounter) => [
          {
            form: { name: 'HTS initial test', package: 'HTS retest' },
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
      encounterType={htsEncounterTypeUUID}
      formList={[{ name: 'HTS Testing ' }]}
      columns={columns}
      description={headerTitle}
      headerTitle={headerTitle}
      launchOptions={{
        displayText: t('add', 'Add'),
        moduleName: 'HTS Clinical View',
      }}
      filter={(encounter) => {
        return encounter.form.uuid == htsInitialEncounterFormUUID || encounter.form.uuid == htsRetest;
      }}
      formConceptMap={hivTestingConceptMap}
    />
  );
};

export default HivTestingEncounters;
