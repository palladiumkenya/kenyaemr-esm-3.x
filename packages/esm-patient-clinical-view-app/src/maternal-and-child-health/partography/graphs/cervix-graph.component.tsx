import React, { useEffect } from 'react';
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
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { LineChart } from '@carbon/charts-react';
import styles from '../partography.scss';
import { SVG_NAMESPACE, getColorForGraph } from '../types';

enum ScaleTypes {
  LABELS = 'labels',
  LINEAR = 'linear',
}

interface ChartDataPoint {
  hour: number;
  time?: string;
  group: string;
  value: number;
}

interface CervixFormData {
  hour: number;
  time: string;
  cervicalDilation: number;
  descentOfHead: number;
  entryDate: string;
  entryTime: string;
}

interface CervixGraphProps {
  cervixFormData: CervixFormData[];
  tableData: any[];
  viewMode: 'graph' | 'table';
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading: boolean;
  controlSize: 'sm' | 'md';
  onAddData: () => void;
  onViewModeChange: (mode: 'graph' | 'table') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  getTableHeaders: () => Array<{ key: string; header: string }>;
}

const CERVIX_CHART_OPTIONS = {
  axes: {
    bottom: {
      title: '',
      mapsTo: 'hour',
      scaleType: ScaleTypes.LINEAR,
      domain: [0, 10],
      ticks: {
        values: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
        formatter: (hour: number) => {
          if (hour === 0) {
            return '0';
          } else if (hour === 0.5) {
            return '0.30';
          } else if (hour % 1 === 0) {
            return `${hour}`;
          } else if (hour % 1 === 0.5) {
            return `${Math.floor(hour)}.30`;
          } else {
            return `${hour}`;
          }
        },
      },
    },
    left: {
      title: 'Cervical Dilation (cm) / Descent of Head (5=high → 1=descended)',
      mapsTo: 'value',
      domain: [0, 10],
      ticks: {
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        formatter: (value: number) => {
          if (value >= 1 && value <= 5) {
            return `${value}cm / D${value}`;
          } else if (value === 0) {
            return '0cm';
          } else {
            return `${value}cm`;
          }
        },
      },
      scaleType: ScaleTypes.LINEAR,
    },
  },
  points: {
    enabled: true,
    radius: 6,
    filled: true,
  },
  curve: 'curveLinear',
  height: '500px',
  theme: 'white',
  toolbar: {
    enabled: false,
  },
  legend: {
    position: 'top',
    clickable: false,
  },
};

const CervixGraph: React.FC<CervixGraphProps> = ({
  cervixFormData,
  tableData,
  viewMode,
  currentPage,
  pageSize,
  totalItems,
  isLoading,
  controlSize,
  onAddData,
  onViewModeChange,
  onPageChange,
  onPageSizeChange,
  getTableHeaders,
}) => {
  const { t } = useTranslation();

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = tableData.slice(startIndex, endIndex);
  const ALERT_START_CM = 4;
  const CERVIX_DILATION_MAX = 10;
  const ALERT_ACTION_DIFFERENCE_HOURS = 4;
  const EXPECTED_LABOR_DURATION_HOURS = 6;

  const staticLinesData: ChartDataPoint[] = [
    { hour: 0, value: ALERT_START_CM, group: 'Alert Line' },
    { hour: EXPECTED_LABOR_DURATION_HOURS, value: CERVIX_DILATION_MAX, group: 'Alert Line' },
    { hour: ALERT_ACTION_DIFFERENCE_HOURS, value: ALERT_START_CM, group: 'Action Line' },
    {
      hour: ALERT_ACTION_DIFFERENCE_HOURS + EXPECTED_LABOR_DURATION_HOURS,
      value: CERVIX_DILATION_MAX,
      group: 'Action Line',
    },
  ];

  const cervicalDilationData: ChartDataPoint[] = cervixFormData.map((data) => ({
    hour: data.hour,
    value: data.cervicalDilation,
    group: 'Cervical Dilation',
    time: data.time,
  }));

  const descentOfHeadData: ChartDataPoint[] = cervixFormData.map((data) => ({
    hour: data.hour,
    value: data.descentOfHead,
    group: 'Descent of Head',
    time: data.time,
  }));

  const finalChartData = [...staticLinesData, ...cervicalDilationData, ...descentOfHeadData];
  const chartOptions = {
    ...CERVIX_CHART_OPTIONS,
    title: 'Cervical Dilation and Descent of Head',
    color: {
      scale: {
        'Alert Line': getColorForGraph('yellow'),
        'Action Line': getColorForGraph('red'),
        'Cervical Dilation': getColorForGraph('green'),
        'Descent of Head': getColorForGraph('blue'),
      },
    },
  };
  const timeLabelsData = [];
  const maxHours = Math.max(10, Math.max(...cervixFormData.map((d) => d.hour), 0) + 1);

  for (let i = 0; i < Math.min(maxHours, 10); i++) {
    const hourLabel = i === 0 ? '0' : `${i}hr`;
    const formDataForHour = cervixFormData.find((data) => data.hour === i);
    const timeValue = formDataForHour ? formDataForHour.time : '--:--';

    timeLabelsData.push({
      hours: hourLabel,
      time: timeValue,
      span: 1,
    });
  }
  useEffect(() => {
    const applyChartStyling = () => {
      const chartContainer = document.querySelector(`[data-chart-id="cervix"]`);
      if (chartContainer) {
        const svgPaths = chartContainer.querySelectorAll('svg path');
        svgPaths.forEach((path) => {
          const pathElement = path as SVGPathElement;
          const pathData = pathElement.getAttribute('d');
          if (pathData) {
            if (pathData.includes('M0') || pathData.includes('L0')) {
              pathElement.style.stroke = getColorForGraph('yellow');
              pathElement.style.strokeWidth = '3px';
              pathElement.style.strokeDasharray = '8,4';
            } else if (pathData.includes('M4') || pathData.includes('L4')) {
              pathElement.style.stroke = getColorForGraph('red');
              pathElement.style.strokeWidth = '3px';
              pathElement.style.strokeDasharray = '8,4';
            }
          }
        });
        const svgCircles = chartContainer.querySelectorAll('svg circle');
        svgCircles.forEach((circle) => {
          const circleElement = circle as SVGCircleElement;
          const parentGroup = circleElement.closest('g');
          if (parentGroup) {
            const stroke = circleElement.getAttribute('stroke') || circleElement.style.stroke;
            const fill = circleElement.getAttribute('fill') || circleElement.style.fill;

            if (stroke === getColorForGraph('green') || fill === getColorForGraph('green')) {
              circleElement.style.display = 'none';

              const cx = parseFloat(circleElement.getAttribute('cx') || '0');
              const cy = parseFloat(circleElement.getAttribute('cy') || '0');
              const size = 6;

              const svg = circleElement.ownerSVGElement;
              if (svg) {
                const line1 = document.createElementNS(SVG_NAMESPACE, 'line');
                line1.setAttribute('x1', (cx - size).toString());
                line1.setAttribute('y1', (cy - size).toString());
                line1.setAttribute('x2', (cx + size).toString());
                line1.setAttribute('y2', (cy + size).toString());
                line1.setAttribute('stroke', getColorForGraph('green'));
                line1.setAttribute('stroke-width', '3');
                line1.setAttribute('stroke-linecap', 'round');

                const line2 = document.createElementNS(SVG_NAMESPACE, 'line');
                line2.setAttribute('x1', (cx + size).toString());
                line2.setAttribute('y1', (cy - size).toString());
                line2.setAttribute('x2', (cx - size).toString());
                line2.setAttribute('y2', (cy + size).toString());
                line2.setAttribute('stroke', getColorForGraph('green'));
                line2.setAttribute('stroke-width', '3');
                line2.setAttribute('stroke-linecap', 'round');

                parentGroup.appendChild(line1);
                parentGroup.appendChild(line2);
              }
            }
          }
        });
      }
    };

    const timer = setTimeout(applyChartStyling, 100);
    return () => clearTimeout(timer);
  }, [cervixFormData, isLoading]);

  const shouldRenderChart = finalChartData.length > 0;

  const totalPages = Math.ceil(totalItems / (pageSize || 1)) || 1;
  const { pageSizes: calculatedPageSizes, itemsDisplayed } = usePaginationInfo(
    pageSize,
    totalPages,
    currentPage,
    totalItems,
  );

  return (
    <div className={styles.graphContainer}>
      <div className={styles.graphHeader}>
        <div className={styles.graphHeaderLeft}>
          <h6>Cervical Dilation and Descent of Head</h6>
          <Tag type="outline">Normal progression varies</Tag>
        </div>
        <div className={styles.graphHeaderRight}>
          <div className={styles.viewSwitcher}>
            <Button
              kind={viewMode === 'graph' ? 'primary' : 'secondary'}
              size={controlSize}
              hasIconOnly
              iconDescription={t('graphView', 'Graph View')}
              onClick={() => onViewModeChange('graph')}
              className={styles.viewButton}>
              <ChartColumn />
            </Button>
            <Button
              kind={viewMode === 'table' ? 'primary' : 'secondary'}
              size={controlSize}
              hasIconOnly
              iconDescription={t('tableView', 'Table View')}
              onClick={() => onViewModeChange('table')}
              className={styles.viewButton}>
              <TableIcon />
            </Button>
          </div>
          <Button kind="primary" size={controlSize} renderIcon={Add} onClick={onAddData}>
            {t('add', 'Add')}
          </Button>
        </div>
      </div>
      <p className={styles.graphDescription}>
        Track cervical dilation and descent of fetal head during labor progression
      </p>

      {viewMode === 'graph' ? (
        <>
          <div className={styles.chartContainer} data-chart-id="cervix">
            {shouldRenderChart ? (
              <div className="cervix-chart-wrapper">
                <LineChart data={finalChartData} options={chartOptions} />
              </div>
            ) : (
              <LineChart
                data={[{ group: 'No Data', time: t('noData', 'No Data'), value: 0 }]}
                options={{
                  ...chartOptions,
                  legend: { enabled: false },
                  points: { enabled: false },
                  color: { scale: { 'No Data': '#d0d0d0' } },
                }}
              />
            )}
          </div>
          {timeLabelsData.length > 0 && (
            <div
              className={styles.customTimeLabelsContainer}
              style={{ '--visible-columns': Math.min(10, timeLabelsData.length) } as React.CSSProperties}>
              <div className={styles.customTimeLabelsRow}>
                <div className={styles.customTimeLabelHeader}>Hours</div>
                {timeLabelsData.map((data, index) => (
                  <div
                    key={`hours-${index}`}
                    className={styles.customTimeLabelCell}
                    style={{
                      gridColumnEnd: `span ${data.span}`,
                      backgroundColor: '#f4f4f4',
                      fontWeight: 700,
                    }}>
                    {data.hours}
                  </div>
                ))}
              </div>
              <div className={styles.customTimeLabelsRow}>
                <div className={styles.customTimeLabelHeader}>Time</div>
                {timeLabelsData.map((data, index) => (
                  <div
                    key={`time-${index}`}
                    className={styles.customTimeLabelCell}
                    style={{ gridColumnEnd: `span ${data.span}` }}>
                    {data.time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.tableContainer}>
          {paginatedData.length > 0 ? (
            <>
              <DataTable rows={paginatedData} headers={getTableHeaders()}>
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
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>

              {totalItems > 0 && (
                <>
                  <Pagination
                    page={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    pageSizes={calculatedPageSizes}
                    onChange={(event) => {
                      onPageChange(event.page);
                      if (event.pageSize !== pageSize) {
                        onPageSizeChange(event.pageSize);
                      }
                    }}
                    size={controlSize}
                  />
                  <div className={styles.tableStats}>
                    <span className={styles.recordCount}>{itemsDisplayed}</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>{t('noDataAvailable', 'No data available for this graph')}</p>
              <Button kind="primary" size={controlSize} renderIcon={Add} onClick={onAddData}>
                {t('addFirstDataPoint', 'Add first data point')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CervixGraph;
