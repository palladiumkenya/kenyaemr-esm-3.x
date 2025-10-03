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

interface UrineTestData {
  timeSlot: string;
  exactTime: string;
  protein: string;
  acetone: string;
  volume: number;
  timeSampleCollected: string;
  timeResultsReturned: string;
  date?: string;
  id?: string;
}

interface UrineTestGraphProps {
  data?: UrineTestData[];
  tableData?: Array<{
    id: string;
    date: string;
    timeSlot: string;
    exactTime: string;
    protein: string;
    acetone: string;
    volume: number;
    timeSampleCollected: string;
    timeResultsReturned: string;
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

const UrineTestGraph: React.FC<UrineTestGraphProps> = ({
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

  // Table headers for urine test data
  const tableHeaders = [
    { key: 'date', header: t('date', 'Date') },
    { key: 'exactTime', header: t('time', 'Time') },
    { key: 'protein', header: t('protein', 'Protein') },
    { key: 'acetone', header: t('acetone', 'Acetone') },
    { key: 'volume', header: t('volume', 'Volume (ml)') },
    { key: 'timeSampleCollected', header: t('timeSampleCollected', 'Sample Collected') },
    { key: 'timeResultsReturned', header: t('timeResultsReturned', 'Results Returned') },
  ];

  // Generate time columns - always show at least 13 empty grids
  const getTimeColumns = () => {
    // Create 13 empty columns by default
    const emptyColumns = Array.from({ length: 13 }, (_, i) => `grid-${i + 1}`);

    if (data.length === 0) {
      // Return 13 empty grids when no data
      return emptyColumns;
    }

    // If we have data, combine unique time slots with empty grids
    const dataTimeSlots = [...new Set(data.map((item) => item.timeSlot))].sort();

    // If data columns are less than 13, fill remaining with empty grids
    if (dataTimeSlots.length <= 13) {
      const remainingEmpty = Array.from({ length: 13 - dataTimeSlots.length }, (_, i) => `empty-${i + 1}`);
      return [...dataTimeSlots, ...remainingEmpty];
    }

    // If more than 13, just return the data columns (scrollable)
    return dataTimeSlots;
  };

  const timeColumns = getTimeColumns();

  // Create grid data for graph view
  const createGridData = () => {
    const gridData: Record<string, { protein: string; acetone: string; volume: number }> = {};

    data.forEach((item) => {
      const key = item.timeSlot; // Use time slot as the key
      gridData[key] = {
        protein: item.protein,
        acetone: item.acetone,
        volume: item.volume,
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
            <h3 className={styles.fetalHeartRateTitle}>Urine Test</h3>
            <div className={styles.fetalHeartRateControls}>
              <span className={styles.legendText}>Protein & Acetone: 0, +, ++, +++ | Volume in ml</span>
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
                iconDescription="Add urine test data"
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
              {/* Protein row */}
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('protein', 'Protein')}</div>
                {timeColumns.map((timeColumn) => {
                  const cellData = gridData[timeColumn];
                  return (
                    <div key={`protein-${timeColumn}`} className={styles.gridCell}>
                      {cellData?.protein || ''}
                    </div>
                  );
                })}
              </div>

              {/* Acetone row */}
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('acetone', 'Acetone')}</div>
                {timeColumns.map((timeColumn) => {
                  const cellData = gridData[timeColumn];
                  return (
                    <div key={`acetone-${timeColumn}`} className={styles.gridCell}>
                      {cellData?.acetone || ''}
                    </div>
                  );
                })}
              </div>

              {/* Volume row */}
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('volume', 'Volume')}</div>
                {timeColumns.map((timeColumn) => {
                  const cellData = gridData[timeColumn];
                  return (
                    <div key={`volume-${timeColumn}`} className={styles.gridCell}>
                      {cellData?.volume || ''}
                    </div>
                  );
                })}
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
                <p>{t('noDataAvailable', 'No urine test data available')}</p>
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

export default UrineTestGraph;
