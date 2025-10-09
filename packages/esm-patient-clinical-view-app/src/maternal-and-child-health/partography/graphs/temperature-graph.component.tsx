import React from 'react';
import { useTranslation } from 'react-i18next';
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
  Pagination,
} from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import styles from '../partography.scss';

interface TemperatureData {
  timeSlot: string;
  exactTime: string;
  temperature: number;
  date?: string;
  id?: string;
}

interface TemperatureGraphProps {
  data?: TemperatureData[];
  tableData?: Array<{
    id: string;
    date: string;
    timeSlot: string;
    exactTime: string;
    temperature: number;
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

const TemperatureGraph: React.FC<TemperatureGraphProps> = ({
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

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = tableData.slice(startIndex, endIndex);

  // Table headers for temperature data
  const tableHeaders = [
    { key: 'date', header: t('date', 'Date') },
    { key: 'exactTime', header: t('exactTime', 'Time') },
    { key: 'temperature', header: t('temperature', 'Temperature (°C)') },
  ];

  // Show all temperature entries in the graph, no filtering by date or time
  // timeColumns: only time values
  const timeColumns = data.map((item, idx) =>
    item.exactTime || item.timeSlot ? item.exactTime || item.timeSlot : '--',
  );

  // Function to get temperature status color
  const getTemperatureStatus = (temperature: number): string => {
    if (temperature < 36.1) {
      return styles.temperatureLow;
    } // Low temperature
    if (temperature >= 36.1 && temperature <= 37.2) {
      return styles.temperatureNormal;
    } // Normal temperature
    if (temperature > 37.2) {
      return styles.temperatureHigh;
    } // High temperature (fever)
    return '';
  };

  // Create grid data for graph view
  const createGridData = () => {
    const gridData: Record<string, { temperature: number }> = {};

    data.forEach((item) => {
      const key = item.timeSlot; // Use time slot as the key
      gridData[key] = {
        temperature: item.temperature,
      };
    });

    return gridData;
  };
  const gridData = createGridData();

  return (
    <div className={styles.fetalHeartRateSection}>
      <div className={styles.fetalHeartRateContainer}>
        <div className={styles.fetalHeartRateHeader}>
          <div className={styles.fetalHeartRateHeaderLeft}>
            <h3 className={styles.fetalHeartRateTitle}>Temperature</h3>
            <div className={styles.fetalHeartRateControls}>
              <span className={styles.legendText}>Normal: 36.1-37.2°C | Low: &lt;36.1°C | High: &gt;37.2°C</span>
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
                iconDescription="Add temperature data"
                disabled={isAddButtonDisabled}
                onClick={onAddData}
                className={styles.addButton}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'graph' ? (
          <div className={styles.membraneGrid}>
            <div className={styles.gridContainer}>
              {/* Header row with time columns */}
              <div className={styles.gridHeader}>
                <div className={styles.gridCell}>{t('time', 'Time')}</div>
                {timeColumns.map((timeColumn) => (
                  <div key={timeColumn} className={styles.gridCell}>
                    {timeColumn}
                  </div>
                ))}
              </div>

              {/* Temperature row */}
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('temperature', 'Temp °C')}</div>
                {data.map((item, idx) => (
                  <div
                    key={`temp-${idx}`}
                    className={`${styles.gridCell} ${item.temperature ? getTemperatureStatus(item.temperature) : ''}`}>
                    {item.temperature !== undefined && item.temperature !== null ? item.temperature : '--'}
                  </div>
                ))}
              </div>
            </div>
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
                    pageSizes={[5, 10, 20, 50]}
                    onChange={(event) => {
                      onPageChange?.(event.page);
                      if (event.pageSize !== pageSize) {
                        onPageSizeChange?.(event.pageSize);
                      }
                    }}
                    size={controlSize}
                  />
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>{t('noDataAvailable', 'No temperature data available')}</p>
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

export default TemperatureGraph;
