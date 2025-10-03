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

  // Table headers for urine test data (remove 'Time' row if not needed)
  const tableHeaders = [
    { key: 'date', header: t('date', 'Date') },
    { key: 'timeSlot', header: t('timeSlot', 'Time Slot') },
    // { key: 'exactTime', header: t('time', 'Time') }, // Removed
    { key: 'protein', header: t('protein', 'Protein') },
    { key: 'acetone', header: t('acetone', 'Acetone') },
    { key: 'volume', header: t('volume', 'Volume (ml)') },
    { key: 'timeSampleCollected', header: t('timeSampleCollected', 'Sample Collected') },
    { key: 'timeResultsReturned', header: t('timeResultsReturned', 'Results Returned') },
  ];

  // Use the same time column logic as cervical contractions: always show 13 columns, each is a real data entry (by index) or blank
  const timeColumns = Array.from(
    { length: Math.max(13, data.length) },
    (_, colIndex) => data[colIndex]?.timeSlot || '',
  );

  // Create grid data for graph view, by index
  const gridData = data;

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
                {timeColumns.map((_, colIndex) => {
                  const cellData = gridData[colIndex];
                  return (
                    <div key={`protein-${colIndex}`} className={styles.gridCell}>
                      {cellData?.protein || ''}
                    </div>
                  );
                })}
              </div>
              {/* Acetone row */}
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('acetone', 'Acetone')}</div>
                {timeColumns.map((_, colIndex) => {
                  const cellData = gridData[colIndex];
                  return (
                    <div key={`acetone-${colIndex}`} className={styles.gridCell}>
                      {cellData?.acetone || ''}
                    </div>
                  );
                })}
              </div>
              {/* Volume row */}
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('volume', 'Volume')}</div>
                {timeColumns.map((_, colIndex) => {
                  const cellData = gridData[colIndex];
                  return (
                    <div key={`volume-${colIndex}`} className={styles.gridCell}>
                      {cellData?.volume != null ? String(cellData.volume) : ''}
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
