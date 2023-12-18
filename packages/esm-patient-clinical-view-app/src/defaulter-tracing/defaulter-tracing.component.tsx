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
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableExpandRow,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandedRow,
  OverflowMenu,
  OverflowMenuItem,
  DataTableSkeleton,
} from '@carbon/react';
import { defaulterTracingEncounterUuid, usePatientTracing } from '../hooks/usePatientTracing';
import { ConfigObject } from '../config-schema';
import { Add } from '@carbon/react/icons';
interface PatientTracingProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}

const DefaulterTracing: React.FC<PatientTracingProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const {
    formsList: { defaulterTracingFormUuid },
  } = useConfig<ConfigObject>();
  const headerTitle = t('defaulterTracing', 'Defaulter Tracing');
  const { encounters, isLoading, error, mutate, isValidating } = usePatientTracing(
    patientUuid,
    defaulterTracingEncounterUuid,
  );
  const handleOpenOrEditDefaulterTracingForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Defaulter Tracing',
      mutateForm: mutate,
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid: defaulterTracingFormUuid,
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
    {
      key: 'actions',
      header: t('actions', 'Actions'),
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
      actions: (
        <OverflowMenu aria-label="overflow-menu" flipped="false">
          <OverflowMenuItem
            onClick={() => handleOpenOrEditDefaulterTracingForm(encounter.uuid)}
            itemText={t('edit', 'Edit')}
          />
          <OverflowMenuItem itemText={t('delete', 'Delete')} isDelete />
        </OverflowMenu>
      ),
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
    <>
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
        rows={tableRows}
        headers={tableHeader}
        render={({
          rows,
          headers,
          getHeaderProps,
          getExpandHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader enableToggle={true} {...getExpandHeaderProps()} />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    <TableExpandedRow
                      colSpan={headers.length + 1}
                      className="demo-expanded-td"
                      {...getExpandedRowProps({
                        row,
                      })}>
                      <h6>To do...</h6>
                    </TableExpandedRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </>
  );
};
export default DefaulterTracing;
