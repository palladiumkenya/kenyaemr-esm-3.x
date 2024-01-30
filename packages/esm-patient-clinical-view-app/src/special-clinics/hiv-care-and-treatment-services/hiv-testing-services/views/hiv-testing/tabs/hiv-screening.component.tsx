import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EncounterList, EncounterListColumn } from '../../../../../../ui/encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../../../../../../ui/encounter-list/encounter-list-utils';
import {
  populationTypeConcept,
  disabilityListConcept,
  departmentConcept,
  eligibilityConcept,
  testingRecommended,
} from '../../../constants';
import { hivScreeningConceptMap } from '../hiv-screening-constants';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';
import { ConfigObject } from '../../../../../../config-schema';

interface HivScreeningEncounterProps {
  patientUuid: string;
}

const HivScreeningEncounters: React.FC<HivScreeningEncounterProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('htsScreening', 'HTS Screening');
  const {
    encounterTypes: { hivTestingServices },
    formsList: { htsScreening },
  } = useConfig<ConfigObject>();

  const htsEncounterTypeUUID = hivTestingServices;
  const htsScreeningFormUUID = htsScreening;

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'visitDate',
        header: t('visitDate', 'Screening Date'),
        getValue: (encounter) => {
          return formatDate(parseDate(encounter.encounterDatetime));
        },
      },
      {
        key: 'populationType',
        header: t('populationType', 'Population type'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, populationTypeConcept);
        },
      },
      {
        key: 'disabilities',
        header: t('disabilities', 'Disabilities'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, disabilityListConcept);
        },
      },
      {
        key: 'department',
        header: t('department', 'Department'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, departmentConcept);
        },
      },
      {
        key: 'clientEligibility',
        header: t('clientEligibility', 'Eligible'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, eligibilityConcept);
        },
      },
      {
        key: 'testingRecommended',
        header: t('testingRecommended', 'Testing recommended'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, testingRecommended);
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
      formList={[{ name: 'HTS screening Form' }]}
      columns={columns}
      description={headerTitle}
      headerTitle={headerTitle}
      launchOptions={{
        displayText: t('add', 'Add'),
        moduleName: 'HTS Clinical View',
      }}
      filter={(encounter) => {
        return encounter.form.uuid == htsScreeningFormUUID;
      }}
      formConceptMap={hivScreeningConceptMap}
    />
  );
};

export default HivScreeningEncounters;
