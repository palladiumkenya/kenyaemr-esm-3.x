import React, { useMemo } from 'react';
import { usePatientTracing } from '../hooks/usePatientTracing';
import { useTranslation } from 'react-i18next';
import { formatDateTime, getObsFromEncounter } from '../../../encounter-list/encounter-list-utils';
import { EncounterList, EncounterListColumn } from '../../../encounter-list/encounter-list.component';
import {
  useConfig,
  formatDate,
  parseDate,
  isDesktop,
  useLayoutType,
  usePagination,
  useVisit,
} from '@openmrs/esm-framework';
import {
  Contacted_UUID,
  MissedAppointmentDate_UUID,
  PatientTracingEncounterType_UUID,
  TracingNumber_UUID,
  TracingOutcome_UUID,
  TracingType_UUID,
} from '../../../utils/constants';
import { defaulterTracing } from '../index';

interface PatientTracingProps {
  patientUuid: string;
  encounterTypeUuid: string;
}

const DefaulterTracing: React.FC<PatientTracingProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const layout = useLayoutType();
  // const { currentVisit } = useVisit(patientUuid);
  const headerTitle = t('defaulterTracing', 'Defaulter Tracing');

  const { encounters, isLoading, isValidating, error } = usePatientTracing(patientUuid, encounterTypeUuid);

  const columns: EncounterListColumn[] = useMemo(
    () => [
      {
        key: 'missedAppointmentDate',
        header: t('missedAppointmentDate', 'Date Missed Appointment'),
        getValue: (encounter) => {
          return getObsFromEncounter(encounter, MissedAppointmentDate_UUID)
            ? getObsFromEncounter(encounter, MissedAppointmentDate_UUID)
            : formatDate(parseDate(encounter.encounterDatetime));
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
  /*  const headers = [
    {
      header: t('missedAppointmentDate', 'Date Missed Appointment'),
      key: 'missedAppointmentDate',
    },
  ];
  const expandHeader = [
    {
      key: 'missedAppointmentDate',
      header: t('missedAppointmentDate', 'Missed App Date'),
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
      header: t('editForm', 'Form'),
      key: 'editForm',
    },
  ];

  const tableRows = Object.entries(pTracing)
    .map(([key, value]) => {
      return { m: key, value: value };
    })
    .map((tracing, index) => ({ id: `${index}`, missedAppointmentDate: tracing, encounter: tracing.value }));

  const dataRows = Object.entries(pTracing)
    .flatMap(([key, value]) =>
      value.flatMap((encounter) =>
        encounter.encounter.obs
          .filter((obs) => obs.concept.uuid === MissedAppointmentDate_UUID)
          .map((filteredObs) => ({
            obsDatetime: filteredObs.obsDatetime,
            value: filteredObs.value,
          })),
      ),
    )
    .map((observation, index) => ({
      id: `${index}`,
      ...observation,
    }));
  return (
    <>
      <DataTable rows={tableRows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer title="DataTable" description="With expansion" {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader aria-label="expand row" />
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
                {rows.map((row, index) => (
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
                      <TableHead>
                        <TableRow>
                          {expandHeader.map((header) => (
                            <TableHeader id={header.key} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      {tableRows[index].encounter.map(({ encounter }, index) => {
                        const { obs = [] } = encounter ?? {};
                        const uniqueDates = new Set();
                        return (
                          <table key={index}>
                            <TableBody>
                              {obs?.map((o, obsIndex) => {
                                if (
                                  !uniqueDates.has(o?.obsDatetime) &&
                                  o?.concept?.uuid === MissedAppointmentDate_UUID
                                ) {
                                  uniqueDates.add(o?.obsDatetime);

                                  // function handleEditEnrollment(arg0: any) {
                                  // }
                                  // launchPatientWorkspace('patient-form-entry-workspace', {
                                  //   workspaceTitle: formName,

                                  //   formInfo: { encounterUuid: '', formUuid: '', visit: currentVisit },
                                  //    });

                                  return (
                                    <TableRow key={row.id}>
                                      <td>{o?.obsDatetime.split('T')[0]}</td>
                                      <td>{o?.value}</td>
                                      <td>
                                        <OverflowMenu ariaLabel="Actions" size="sm" flipped>
                                          <OverflowMenuItem
                                            hasDivider
                                            itemText={t('edit', 'Edit')}
                                            // onClick={() => handleEditEnrollment(tableRows[index])}
                                          />
                                        </OverflowMenu>
                                      </td>
                                    </TableRow>
                                  );
                                }
                                return null;
                              })}
                            </TableBody>
                          </table>
                        );
                      })}
                    </TableExpandedRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </>
  );*/
};
export default DefaulterTracing;
