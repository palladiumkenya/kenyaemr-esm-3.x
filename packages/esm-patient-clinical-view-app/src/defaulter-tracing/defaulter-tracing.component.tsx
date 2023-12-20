import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import {
  Contacted_UUID,
  MissedAppointmentDate_UUID,
  PatientTracingEncounterType_UUID,
  TracingNumber_UUID,
  TracingOutcome_UUID,
  TracingType_UUID,
  PatientTracingFormName,
} from '../../../utils/constants';
import { EncounterList, EncounterListColumn } from '../encounter-list/encounter-list.component';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { Button } from '@carbon/react';

interface PatientTracingProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}

const DefaulterTracing: React.FC<PatientTracingProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const headerTitle = t('defaulterTracing', 'Defaulter Tracing');

  const handleOpenDefaulterTracingForm = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Defaulter Tracing',
      formInfo: {
        encounterUuid: '',
        formUuid: 'a1a62d1e-2def-11e9-b210-d663bd873d93',
        patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
      },
    });
  };
  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'missedAppointmentDate',
        header: t('missedAppointmentDate', 'Date Missed Appointment'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, MissedAppointmentDate_UUID) == '--' ||
            getObsFromEncounter(encounter, MissedAppointmentDate_UUID) == null
            ? formatDate(parseDate(encounter.encounterDatetime))
            : formatDate(parseDate(getObsFromEncounter(encounter, MissedAppointmentDate_UUID)));
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
      {
        key: 'actions',
        header: t('actions', 'Actions'),
        getValue: (encounter) => {
          const baseActions = [
            {
              form: { name: PatientTracingFormName, package: 'hiv' },
              encounterUuid: encounter.uuid,
              intent: '*',
              label: 'Edit Form',
              mode: 'edit',
            },
          ];
          return baseActions;
        },
      },
    ],
    [],
  );

  return (
    <>
      <CardHeader title={headerTitle}>
        <Button onClick={handleOpenDefaulterTracingForm} style={{ marginLeft: '0.625rem' }} kind="ghost">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <EncounterList
        patientUuid={patientUuid}
        encounterType={PatientTracingEncounterType_UUID}
        formList={[{ name: PatientTracingFormName }]}
        columns={columns}
        description={headerTitle}
        headerTitle={headerTitle}
        launchOptions={{
          displayText: t('add', 'Add'),
          moduleName: '/kenyaemr-esm-3.x-care-panel-app',
        }}
      />
    </>
  );
};
export default DefaulterTracing;
