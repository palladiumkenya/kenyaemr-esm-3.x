import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  Contacted_UUID,
  MissedAppointmentDate_UUID,
  TracingNumber_UUID,
  TracingOutcome_UUID,
  TracingType_UUID,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  OverflowMenu,
  OverflowMenuItem,
  DataTableSkeleton,
} from '@carbon/react';
import { defaulterTracingEncounterUuid, usePatientTracing } from '../../../hooks/usePatientTracing';
import { ConfigObject } from '../../../config-schema';
import { Add } from '@carbon/react/icons';
import styles from './defaulter-tracing.scss';
interface PatientTracingProps {
  patientUuid: string;
}

const DefaulterTracing: React.FC<PatientTracingProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { formsList } = config ?? {};
  const headerTitle = t('defaulterTracing', 'Defaulter Tracing');
  const { encounters, isLoading, error, mutate, isValidating } = usePatientTracing(
    patientUuid,
    defaulterTracingEncounterUuid,
  );
  const handleOpenOrEditDefaulterTracingForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Defaulter Tracing',
      mutateForm: () => mutate(),
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid: formsList?.defaulterTracingFormUuid,
        patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
      },
    });
  };
  const tableHeader = [
    {
      key: 'missedAppointmentDate',
      header: t('missedAppointmentDate', 'Date Missed Appointment'),
    },
    {
      key: 'visitDate',
      header: t('visitDate', 'Tracing Date'),
    },
    {
      key: 'tracingType',
      header: t('tracingType', 'Tracing Type'),
    },
    {
      key: 'tracingNumber',
      header: t('tracingNumber', 'Tracing No.'),
    },
    {
      key: 'contacted',
      header: t('contacted', 'Contacted'),
    },
    {
      key: 'finalOutcome',
      header: t('finalOutcome', 'Final Outcome'),
    },
  ];

  const tableRows = encounters.map((encounter, index) => {
    return {
      id: `${encounter.uuid}`,
      missedAppointmentDate:
        getObsFromEncounter(encounter, MissedAppointmentDate_UUID) == '--' ||
        getObsFromEncounter(encounter, MissedAppointmentDate_UUID) == null
          ? formatDate(parseDate(encounter.encounterDatetime))
          : formatDate(parseDate(getObsFromEncounter(encounter, MissedAppointmentDate_UUID))),
      visitDate: formatDate(new Date(encounter.encounterDatetime)),
      tracingType: getObsFromEncounter(encounter, TracingType_UUID),
      tracingNumber: getObsFromEncounter(encounter, TracingNumber_UUID),
      contacted: getObsFromEncounter(encounter, Contacted_UUID),
      finalOutcome: getObsFromEncounter(encounter, TracingOutcome_UUID),
    };
  });

  if (isLoading) {
    return <DataTableSkeleton headers={tableHeader} aria-label="Defaulter Tracing" />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('defaulterTracing', 'Defaulter Tracing')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('defaulterTracing', 'Defaulter Tracing')}
        headerTitle={t('defaulterTracing', 'Defaulter Tracing')}
        launchForm={handleOpenOrEditDefaulterTracingForm}
      />
    );
  }
  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <Button
          size="md"
          kind="ghost"
          onClick={() => handleOpenOrEditDefaulterTracingForm()}
          renderIcon={(props) => <Add size={24} {...props} />}
          iconDescription="Add">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows}
        headers={tableHeader}
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer size="sm" {...getTableContainerProps()}>
            <Table size="sm" {...getTableProps()} aria-label={t('defaulterTracing', 'Defaulter tracing')}>
              <TableHead>
                <TableRow>
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader aria-label="overflow actions" />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    {...getRowProps({
                      row,
                    })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <OverflowMenu aria-label="overflow-menu" flipped="false">
                        <OverflowMenuItem
                          onClick={() => handleOpenOrEditDefaulterTracingForm(encounters[index]?.uuid)}
                          itemText={t('edit', 'Edit')}
                        />
                      </OverflowMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </div>
  );
};
export default DefaulterTracing;
