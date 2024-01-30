import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EncounterList, EncounterListColumn } from '../ui/encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../ui/encounter-list/encounter-list-utils';
import {
  hivTestResultConcept,
  MotherNextVisitDate,
  motherGeneralConditionConcept,
  pphConditionConcept,
} from './concepts/mch-concepts';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { pncConceptMap } from './concept-maps/postnatal-care-concepts-map';

interface PostnatalCareProps {
  patientUuid: string;
}

const PostnatalCare: React.FC<PostnatalCareProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('postnatalCare', 'Postnatal Care');

  const {
    encounterTypes: { mchMotherConsultation },
    formsList: { postnatal },
  } = useConfig<ConfigObject>();

  const MotherPNCEncounterTypeUUID = mchMotherConsultation;
  const MotherPNCEncounterFormUUID = postnatal;

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
        key: 'hivTestResults',
        header: t('hivTestResults', 'HIV Status'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, hivTestResultConcept);
        },
      },
      {
        key: 'motherGeneralCondition',
        header: t('motherGeneralCondition', 'General condition'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, motherGeneralConditionConcept, true);
        },
      },
      {
        key: 'pphCondition',
        header: t('pphCondition', 'PPH present'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, pphConditionConcept);
        },
      },
      {
        key: 'uterusCondition',
        header: t('uterusCondition', 'PPH Condition of uterus'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, pphConditionConcept);
        },
      },
      {
        key: 'nextVisitDate',
        header: t('nextVisitDate', 'Next visit date'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, MotherNextVisitDate, true);
        },
      },
      {
        key: 'actions',
        header: t('actions', 'Actions'),
        getValue: (encounter) => [
          {
            form: { name: 'Mother - Postnatal Form', package: 'maternal_health' },
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
      encounterType={MotherPNCEncounterTypeUUID}
      formList={[{ name: 'Mother - Postnatal Form' }]}
      columns={columns}
      description={headerTitle}
      headerTitle={headerTitle}
      launchOptions={{
        displayText: t('add', 'Add'),
        moduleName: 'MCH Clinical View',
      }}
      filter={(encounter) => {
        return encounter.form.uuid == MotherPNCEncounterFormUUID;
      }}
      formConceptMap={pncConceptMap}
    />
  );
};

export default PostnatalCare;
