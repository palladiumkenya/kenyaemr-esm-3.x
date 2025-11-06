import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tag,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
} from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import { LineChart } from '@carbon/charts-react';
import styles from '../partography.scss';
import { getColorForGraph, generateRange } from '../types';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

enum ScaleTypes {
  LABELS = 'labels',
  LINEAR = 'linear',
}

interface FetalHeartRateGraphProps {
  data?: Array<{
    hour: number;
    value: number;
    group: string;
    time?: string;
    date?: string;
    id?: string;
  }>;
  tableData?: Array<{
    id: string;
    date: string;
    time: string;
    value: string;
    hour: string;
  }>;
  viewMode?: 'graph' | 'table';
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  controlSize?: 'sm' | 'md';
  onAddData?: () => void;
  onViewModeChange?: (mode: 'graph' | 'table') => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isAddButtonDisabled?: boolean;
}

const FetalHeartRateGraph: React.FC<FetalHeartRateGraphProps> = ({
  data = [],
  tableData = [],
  viewMode = 'graph',
  currentPage = 1,
  pageSize = 5,
  totalItems = 0,
  controlSize = 'sm',
  onAddData,
  onViewModeChange,
  onPageChange,
  onPageSizeChange,
  isAddButtonDisabled = true,
}) => {
  const { t } = useTranslation();
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = tableData.slice(startIndex, endIndex);
  const { pageSizes: calculatedPageSizes, itemsDisplayed } = usePaginationInfo(
    pageSize,
    Math.ceil(totalItems / pageSize),
    currentPage,
    totalItems,
  );
  const getFetalHeartRateStatus = (value: string): { type: string; text: string; color: string } => {
    const numValue = parseInt(value.replace(' bpm', ''));
    if (numValue < 100) {
      return { type: 'orange', text: t('low', 'Low'), color: getColorForGraph('orange') };
    } else if (numValue >= 100 && numValue <= 180) {
      return { type: 'green', text: t('normal', 'Normal'), color: getColorForGraph('green') };
    } else {
      return { type: 'red', text: t('abnormal', 'Abnormal'), color: getColorForGraph('red') };
    }
  };
  const tableHeaders = [
    { key: 'date', header: t('date', 'Date') },
    { key: 'time', header: t('time', 'Time') },
    { key: 'hour', header: t('hour', 'Hour') },
    { key: 'value', header: t('fetalHeartRate', 'Fetal Heart Rate (bpm)') },
    { key: 'status', header: t('status', 'Status') },
  ];
  const getFetalHeartRateColor = (value: number): string => {
    if (value < 100) {
      return getColorForGraph('orange');
    } else if (value >= 100 && value <= 180) {
      return getColorForGraph('green');
    } else {
      return getColorForGraph('red');
    }
  };

  const enhancedChartData = React.useMemo(() => {
    if (data && data.length > 0) {
      return data.map((point) => ({
        ...point,
        group: t('fetalHeartRate', 'Fetal Heart Rate'),
        color: getFetalHeartRateColor(point.value),
      }));
    }

    return [];
  }, [data, t]);

  const chartData = enhancedChartData;
  const chartKey = React.useMemo(() => JSON.stringify(enhancedChartData), [enhancedChartData]);

  const chartOptions = {
    title: '',
    axes: {
      bottom: {
        title: '',
        mapsTo: 'hour',
        scaleType: ScaleTypes.LINEAR,
        domain: [0, 10],
        ticks: {
          values: React.useMemo(() => generateRange(0, 10, 0.5), []),
          formatter: (hour: number) => {
            if (hour === 0) {
              return '0';
            }
            if (hour === 0.5) {
              return '0:30';
            }
            if (hour % 1 === 0) {
              return `${hour}:00`;
            }
            if (hour % 1 === 0.5) {
              return `${Math.floor(hour)}:30`;
            }
            return `${hour}`;
          },
        },
      },
      left: {
        title: t('fetalHeartRateBpm', 'Fetal Heart Rate (bpm)'),
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        domain: [80, 200],
        ticks: {
          values: React.useMemo(() => generateRange(80, 200, 10), []),
          formatter: (value: number) => `${value}`,
        },
      },
    },
    height: '600px',
    curve: 'curveLinear',
    points: {
      enabled: true,
      radius: 6,
      filled: true,
    },
    grid: {
      x: {
        enabled: true,
      },
      y: {
        enabled: true,
      },
    },
    referenceLines: [
      {
        axis: 'left',
        value: 110,
        style: {
          stroke: '#111',
          strokeWidth: 4,
          strokeDasharray: '0',
        },
        label: '110',
      },
      {
        axis: 'left',
        value: 160,
        style: {
          stroke: '#111',
          strokeWidth: 4,
          strokeDasharray: '0',
        },
        label: '160',
      },
    ],
    color: {
      scale:
        data && data.length > 0
          ? (datapoint: any) => getFetalHeartRateColor(datapoint.value)
          : {
              [t('fetalHeartRate', 'Fetal Heart Rate')]: 'transparent', // Hide empty data lines
            },
    },
    legend: {
      enabled: false,
    },
    theme: 'white',
    toolbar: {
      enabled: false,
    },
  };

  return (
    <div className={styles.fetalHeartRateSection}>
      <div className={styles.fetalHeartRateContainer}>
        <div className={styles.fetalHeartRateHeader}>
          <div className={styles.fetalHeartRateHeaderLeft}>
            <h3 className={styles.fetalHeartRateTitle}>{t('fetalHeartRate', 'Fetal Heart Rate')}</h3>
            <div className={styles.fetalHeartRateControls}>
              <Tag type="green" title={t('normalRange', 'Normal Range')}>
                {t('normalRange100180', 'Normal (100-180)')}
              </Tag>
              <Tag type="red" title={t('abnormalRange', 'Abnormal Range')}>
                {t('abnormalRangeGreater180', 'Abnormal (>180)')}
              </Tag>
              <Tag type="gray" title={t('lowRange', 'Low Range')} className={styles.tagLowRange}>
                {t('lowRangeLess100', 'Low (<100)')}
              </Tag>
            </div>
          </div>
          <div className={styles.fetalHeartRateHeaderRight}>
            <div className={styles.fetalHeartRateActions}>
              <div className={styles.viewSwitcher}>
                <Button
                  kind={viewMode === 'graph' ? 'primary' : 'secondary'}
                  size={controlSize}
                  hasIconOnly
                  iconDescription={t('graphView', 'Graph View')}
                  onClick={() => onViewModeChange?.('graph')}
                  className={styles.viewButton}>
                  <ChartColumn />
                </Button>
                <Button
                  kind={viewMode === 'table' ? 'primary' : 'secondary'}
                  size={controlSize}
                  hasIconOnly
                  iconDescription={t('tableView', 'Table View')}
                  onClick={() => onViewModeChange?.('table')}
                  className={styles.viewButton}>
                  <TableIcon />
                </Button>
              </div>
              <Button
                kind="primary"
                size={controlSize}
                renderIcon={Add}
                iconDescription={t('addFetalHeartRateData', 'Add fetal heart rate data')}
                disabled={isAddButtonDisabled}
                onClick={onAddData}
                className={styles.addButton}>
                {t('add', 'Add')}
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'graph' ? (
          <div className={styles.fetalHeartRateChart}>
            {chartData.length > 0 ? (
              <LineChart data={chartData} options={chartOptions} key={chartKey} />
            ) : (
              <LineChart
                data={[{ hour: 0, value: 140, group: 'No Data', time: '0:00' }]}
                options={{
                  ...chartOptions,
                  legend: { enabled: false },
                  points: { enabled: false },
                  color: { scale: { 'No Data': 'transparent' } },
                }}
                key="empty-chart"
              />
            )}
          </div>
        ) : (
          <div className={styles.tableContainer}>
            {paginatedData.length > 0 ? (
              <>
                <DataTable rows={paginatedData} headers={tableHeaders}>
                  {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                    <TableContainer title="" description="">
                      <Table {...getTableProps()} size="sm">
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow {...getRowProps({ row })} key={row.id}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>
                                  {cell.info.header === 'status'
                                    ? (() => {
                                        const status = getFetalHeartRateStatus(
                                          row.cells.find((c) => c.info.header === 'value')?.value || '0 bpm',
                                        );
                                        return (
                                          <Tag
                                            type={status.type as any}
                                            title={t('fetalHeartRateStatus', 'Fetal Heart Rate: {{status}}', {
                                              status: status.text,
                                            })}>
                                            {status.text}
                                          </Tag>
                                        );
                                      })()
                                    : cell.info.header === 'value'
                                    ? (() => {
                                        const numValue = parseInt(cell.value.replace(' bpm', ''));
                                        if (numValue < 100) {
                                          return (
                                            <span
                                              className={`${styles.fetalHeartRateValue} ${styles.low}`}
                                              style={{ color: getColorForGraph('orange') }}>
                                              <span className={styles.arrow}>↓</span>
                                              {cell.value}
                                            </span>
                                          );
                                        } else if (numValue > 180) {
                                          return (
                                            <span
                                              className={`${styles.fetalHeartRateValue} ${styles.high}`}
                                              style={{ color: getColorForGraph('red') }}>
                                              <span className={styles.arrow}>↑</span>
                                              {cell.value}
                                            </span>
                                          );
                                        } else {
                                          return (
                                            <span
                                              className={`${styles.fetalHeartRateValue} ${styles.normal}`}
                                              style={{ color: getColorForGraph('green') }}>
                                              {cell.value}
                                            </span>
                                          );
                                        }
                                      })()
                                    : cell.value}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>

                {totalItems > 0 && (
                  <Pagination
                    page={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    pageSizes={calculatedPageSizes}
                    onChange={(event) => {
                      onPageChange?.(event.page);
                      if (event.pageSize !== pageSize) {
                        onPageSizeChange?.(event.pageSize);
                      }
                    }}
                    size={controlSize}
                  />
                )}
                {totalItems > 0 && <div className={styles.paginationInfo}>{itemsDisplayed}</div>}
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>{t('noDataAvailable', 'No data available for fetal heart rate')}</p>
                <Button kind="primary" size={controlSize} renderIcon={Add} onClick={onAddData}>
                  {t('addFirstDataPoint', 'Add first data point')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FetalHeartRateGraph;
