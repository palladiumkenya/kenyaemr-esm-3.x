import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Button,
} from '@carbon/react';
import { Add, ChartLineSmooth } from '@carbon/react/icons';
import {
  EmptyDataIllustration,
  ErrorState,
  CardHeader,
  launchPatientWorkspace,
  EmptyState,
} from '@openmrs/esm-patient-common-lib';
import { formatDate, isDesktop, parseDate, useLayoutType } from '@openmrs/esm-framework';
import styles from './labour-delivery.scss';
import { usePartograph } from '../../hooks/usePartograph';
import dayjs from 'dayjs';
import {
  CervicalDilation,
  DeviceRecorded,
  FetalHeartRate,
  PartographEncounterFormUuid,
  SurgicalProcedure,
  descentOfHeadObj,
} from '../../utils/constants';
import PartographChart from './partograph-chart';

interface PartographyProps {
  patientUuid: string;
  filter?: (encounter: any) => boolean;
}

const Partograph: React.FC<PartographyProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [chartView, setChartView] = React.useState<boolean>();
  const { encounters = [], isLoading, isValidating, error, mutate } = usePartograph(patientUuid);
  const headerTitle = t('partograph', 'Partograph');
  const displayText = t('partographData', 'Vital Components');
  const headers = [
    {
      header: t('date', 'Date'),
      key: 'date',
    },
    {
      header: t('timeRecorded', 'Time Recorded'),
      key: 'timeRecorded',
    },
    {
      header: t('fetalHeartRate', 'Fetal Heart Rate'),
      key: 'fetalHeartRate',
    },
    {
      header: t('cervicalDilation', 'Cervical Dilation cm'),
      key: 'cervicalDilation',
    },
    {
      header: t('descentOfHead', 'Descent of Head'),
      key: 'descentOfHead',
    },
  ];
  const tableRows =
    encounters.map((encounter) => {
      const groupMembers = encounter.groupMembers;
      const groupmembersObj = groupMembers.reduce((acc, curr) => {
        acc[curr.concept.uuid] =
          typeof curr.value === 'string' || typeof curr.value === 'number' ? curr.value : curr.value.uuid;
        return acc;
      });
      return {
        id: `${encounter.uuid}`,
        date: formatDate(parseDate(encounter.obsDatetime.toString()), { mode: 'wide', time: true }),
        timeRecorded: dayjs(new Date(groupmembersObj[DeviceRecorded])).format('HH:mm'),
        fetalHeartRate: groupmembersObj[FetalHeartRate],
        cervicalDilation: groupmembersObj[CervicalDilation],
        descentOfHead: descentOfHeadObj[groupmembersObj[SurgicalProcedure]],
        contractionFrequency: '--', // TODO: get from obsGroup 163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        contractionDuration: '--', // TODO: get from obsGroup 163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
      };
    }) ?? [];
  const chartData =
    encounters.map((encounter) => {
      const groupMembers = encounter.groupMembers;
      const groupmembersObj = groupMembers.reduce((acc, curr) => {
        acc[curr.concept.uuid] =
          typeof curr.value === 'string' || typeof curr.value === 'number' ? curr.value : curr.value.uuid;
        return acc;
      });
      return {
        id: `${encounter.uuid}`,
        date: formatDate(parseDate(encounter.obsDatetime.toString()), { mode: 'wide', time: true }),
        fetalHeartRate: groupmembersObj[FetalHeartRate],
        cervicalDilation: groupmembersObj[CervicalDilation],
        descentOfHead: descentOfHeadObj[groupmembersObj[SurgicalProcedure]],
      };
    }) ?? [];
  const handleAddHistory = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: headerTitle,
      mutateForm: () => {
        mutate();
      },
      formInfo: {
        encounterUuid: '',
        formUuid: PartographEncounterFormUuid,
        additionalProps: {} ?? {},
      },
    });
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (encounters?.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>There is no partograph data to display for this patient.</p>
          <Button onClick={handleAddHistory} renderIcon={Add} kind="ghost">
            {t('recordLabourDetails', 'Record labour details')}
          </Button>
        </Tile>
      </Layer>
    );
  }
  return (
    <>
      {(() => {
        if (encounters && encounters?.length) {
          return (
            <div className={styles.widgetCard}>
              <CardHeader title={headerTitle}>
                <div className={styles.backgroundDataFetchingIndicator}>
                  <span>{isValidating ? isLoading : null}</span>
                </div>
                <div className={styles.vitalsHeaderActionItems}>
                  <div className={styles.toggleButtons}>
                    <Button
                      className={styles.tableViewToggle}
                      size="sm"
                      kind={chartView ? 'ghost' : 'tertiary'}
                      hasIconOnly
                      renderIcon={(props) => <Table {...props} size={16} />}
                      iconDescription={t('tableView', 'Table View')}
                      onClick={() => setChartView(false)}
                    />
                    <Button
                      className={styles.chartViewToggle}
                      size="sm"
                      kind={chartView ? 'tertiary' : 'ghost'}
                      hasIconOnly
                      renderIcon={(props) => <ChartLineSmooth {...props} size={16} />}
                      iconDescription={t('chartView', 'Chart View')}
                      onClick={() => setChartView(true)}
                    />
                  </div>
                  <span className={styles.divider}>|</span>

                  <Button
                    kind="ghost"
                    renderIcon={(props) => <Add {...props} size={16} />}
                    iconDescription="Add vitals">
                    {t('add', 'Add')}
                  </Button>
                </div>
              </CardHeader>
              {chartView ? (
                <PartographChart partograpyComponents={chartData} />
              ) : (
                <DataTable
                  useZebraStyles
                  headers={headers}
                  rows={tableRows}
                  size="sm"
                  render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => {
                    return (
                      <TableContainer {...getTableContainerProps()}>
                        <Table {...getTableProps()}>
                          <TableHead>
                            <TableRow>
                              {headers.map((header) => (
                                <TableHeader
                                  {...getHeaderProps({
                                    header,
                                    isSortable: header.isSortable,
                                  })}>
                                  {header.header?.content ?? header.header}
                                </TableHeader>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row) => (
                              <TableRow key={row.id}>
                                {row.cells.map((cell) => (
                                  <TableCell key={cell.id}>{cell.value ?? '--'}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  }}
                />
              )}
            </div>
          );
        }
        return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
      })()}
    </>
  );
};
export default Partograph;
