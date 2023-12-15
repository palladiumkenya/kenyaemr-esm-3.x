import React, { useMemo } from 'react';
import { usePatientTracing } from '../hooks/usePatientTracing';
import { useTranslation } from 'react-i18next';
import { formatDateTime, getObsFromEncounter } from '../../../encounter-list/encounter-list-utils';
import { EncounterList, EncounterListColumn } from '../../../encounter-list/encounter-list.component';
import { useConfig, formatDate, parseDate } from '@openmrs/esm-framework';
import {
  Contacted_UUID,
  MissedAppointmentDate_UUID,
  PatientTracingEncounterType_UUID,
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
        key: 'missedAppointmentDate',
        header: t('missedAppointmentDate', 'Date Missed Appointment'),
        getValue: (encounter) => {
          console.log((getObsFromEncounter(encounter, MissedAppointmentDate_UUID)));
          return '';
        },
      },
      {
        key: 'visitDate',
        header: t('visitDate', 'Tracing Date'),
        getValue: (encounter) => {
          return formatDate(parseDate(encounter.encounterDatetime));
        },
      },
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
