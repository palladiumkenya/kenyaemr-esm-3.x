import React, { useMemo } from 'react';
import { usePatientTracing } from '../hooks/usePatientTracing';
import { useTranslation } from 'react-i18next';
import { getObsFromEncounter } from '../../../utils/encounter-list-utils';
import { EncounterList, EncounterListColumn } from '../../../encounter-list/encounter-list.component';
import {
  Contacted_UUID,
  PatientTracingEncounterType_UUID,
  TracingDate_UUID,
  TracingNumber_UUID,
  TracingOutcome_UUID,
  TracingType_UUID,
} from '../../../utils/constants';

interface PatientTracingProps {
  patientUuid: string;
  encounterTypeUuid: string;
}

const DefaulterTracing: React.FC<PatientTracingProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('defaulterTracing', 'Defaulter Tracing');
  const { encounters, isLoading, isValidating, error } = usePatientTracing(patientUuid, encounterTypeUuid);

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'tracingDate',
        header: t('date', 'Tracing Date'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, TracingDate_UUID);
        },
      },
      /*  {
        key: 'visitDate',
        header: t('visitDate', 'Visit Date'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, visitDate, true);
        },
      },*/
      {
        key: 'tracingType',
        header: t('tracingType', 'Tracing Type'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, TracingType_UUID);
        },
      },
      {
        key: 'tracingNumber',
        header: t('tracingNumber', 'Tracing No.'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, TracingNumber_UUID);
        },
      },
      {
        key: 'contacted',
        header: t('contacted', 'Contacted'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, Contacted_UUID);
        },
      },
      {
        key: 'finalOutcome',
        header: t('finalOutcome', 'Final Outcome'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, TracingOutcome_UUID);
        },
      },
    ],
    [],
  );

  /*  const headers = [
      {
        header: t('date', 'Date'),
        key: 'date',
      },
      {
        header: t('tracingType', 'Tracing Type'),
        key: 'tracingType',
      },
      {
        header: t('tracingNumber', 'Tracing No.'),
        key: 'tracingNumber',
      },
      {
        header: t('contacted', 'Contacted'),
        key: 'contacted',
      },
      {
        header: t('finalOutcome', 'Final Outcome'),
        key: 'finalOutcome',
      },
    ];*/

  /*  const rowData = encounters.map((encounters) => {
    return {
      id: `${encounters.uuid}`,
      date: encounters?.encounterDatetime
        ? formatDate(parseDate(encounters?.encounterDatetime), { mode: 'wide' })
        : '--',
      tracingType: encounters.value,
      tracingNumber: encounters.value,
      contacted: encounters.value,
      finalOutcome: encounters.value,
    };
  });*/
  return (
    <EncounterList
      patientUuid={patientUuid}
      encounterType={PatientTracingEncounterType_UUID}
      columns={columns}
      description={headerTitle}
      headerTitle={headerTitle}
      launchOptions={{
        displayText: t('add', 'Add'),
        moduleName: 'Patient Tracing',
      }}
    />
  );
};
export default DefaulterTracing;
