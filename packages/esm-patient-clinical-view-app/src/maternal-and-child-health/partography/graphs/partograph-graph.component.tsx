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
import { getColorForGraph } from '../types';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

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

interface GraphDefinition {
  id: string;
  title: string;
  color: string;
  yAxisLabel: string;
  yMin: number;
  yMax: number;
  normalRange: string;
  description: string;
}

interface PartographGraphProps {
  graph: GraphDefinition;
  data: ChartDataPoint[];
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
  getColorForGraph: (color: string) => string;
}

const PartographGraph: React.FC<PartographGraphProps> = ({
  graph,
  data,
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
  getColorForGraph,
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

  const chartOptions = {
    title: graph.title,
    axes: {
      bottom: {
        title: undefined,
        mapsTo: 'time',
        scaleType: ScaleTypes.LABELS,
        tick: {
          formatter: () => '',
        },
      },
      left: {
        title: graph.yAxisLabel,
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        domain: [graph.yMin, graph.yMax],
      },
    },
    curve: 'curveLinear',
    height: '500px',
    color: {
      scale: {
        [data[0]?.group || graph.id]: getColorForGraph(graph.color),
        Systolic: getColorForGraph('red'),
        Diastolic: getColorForGraph('green'),
      },
    },
    points: {
      enabled: true,
      radius: 5,
      filled: true,
    },
    legend: {
      position: 'bottom',
      clickable: false,
    },
    theme: 'white',
    toolbar: {
      enabled: false,
    },
  };

  const shouldRenderChart = data.length > 0;

  return (
    <div className={styles.graphContainer}>
      <div className={styles.graphHeader}>
        <div className={styles.graphHeaderLeft}>
          <h6>{graph.title}</h6>
          <Tag type="outline">{graph.normalRange}</Tag>
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
      <p className={styles.graphDescription}>{graph.description}</p>

      {viewMode === 'graph' ? (
        <div className={styles.chartContainer}>
          {shouldRenderChart ? (
            <LineChart data={data} options={chartOptions} />
          ) : (
            <LineChart
              data={[{ group: graph.title, time: t('noData', 'No Data'), value: graph.yMin }]}
              options={{
                ...chartOptions,
                legend: { enabled: false },
                points: { enabled: false },
                color: { scale: { [graph.title]: getColorForGraph('gray') } },
              }}
            />
          )}

          {data.length > 0 && !isLoading && (
            <div className={styles.chartStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>{t('latest', 'Latest')}:</span>
                <span className={styles.statValue}>
                  {data[data.length - 1]?.value?.toFixed(1)} {graph.yAxisLabel}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>{t('average', 'Average')}:</span>
                <span className={styles.statValue}>
                  {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)} {graph.yAxisLabel}
                </span>
              </div>
            </div>
          )}
        </div>
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
              )}
              {totalItems > 0 && <div className={styles.paginationInfo}>{itemsDisplayed}</div>}
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

export default PartographGraph;
