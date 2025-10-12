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
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

interface MembraneAmnioticFluidData {
  timeSlot: string;
  exactTime: string;
  amnioticFluid: string;
  moulding: string;
  date?: string;
  id?: string;
}

interface MembraneAmnioticFluidGraphProps {
  data?: MembraneAmnioticFluidData[];
  tableData?: Array<{
    id: string;
    date: string;
    timeSlot: string;
    exactTime: string;
    amnioticFluid: string;
    moulding: string;
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

const MembraneAmnioticFluidGraph: React.FC<MembraneAmnioticFluidGraphProps> = ({
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

  const tableHeaders = [
    { key: 'date', header: t('date', 'Date') },
    { key: 'exactTime', header: t('exactTime', 'Exact Time') },
    { key: 'amnioticFluid', header: t('amnioticFluid', 'Amniotic Fluid') },
    { key: 'moulding', header: t('moulding', 'Moulding') },
  ];

  const getTimeColumns = () => {
    const emptyColumns = Array.from({ length: 13 }, (_, i) => `grid-${i + 1}`);
    if (data.length === 0) {
      return emptyColumns;
    }
    const dataTimes = data.map((item, idx) => item.exactTime || String(idx));
    if (dataTimes.length <= 13) {
      const remainingEmpty = Array.from({ length: 13 - dataTimes.length }, (_, i) => `empty-${i + 1}`);
      return [...dataTimes, ...remainingEmpty];
    }
    return dataTimes;
  };

  const timeColumns = getTimeColumns();

  const getAmnioticFluidInitials = (value: string): string => {
    const amnioticFluidMap: Record<string, string> = {
      'Membrane intact': 'M',
      'Clear liquor': 'C',
      Clear: 'C',
      'Meconium Stained': 'MS',
      'Meconium staining': 'MS',
      Absent: 'A',
      'Blood Stained': 'B',
      'Blood stained': 'B',
      A: 'A',
      C: 'C',
      MS: 'MS',
      B: 'B',
    };
    return amnioticFluidMap[value] || value.charAt(0).toUpperCase();
  };

  const getAmnioticFluidLabel = (value: string): string => {
    const amnioticFluidLabelMap: Record<string, string> = {
      M: 'Membrane intact',
      C: 'Clear liquor',
      MS: 'Meconium Stained',
      A: 'Absent',
      B: 'Blood Stained',
    };
    return amnioticFluidLabelMap[value] || value;
  };

  const getMouldingSymbol = (value: string): string => {
    const mouldingMap: Record<string, string> = {
      '0': '0',
      '+': '+',
      '++': '++',
      '+++': '+++',
      None: '0',
      'ONE PLUS': '+',
      'TWO PLUS': '++',
      'THREE PLUS': '+++',
    };
    return mouldingMap[value] || value;
  };

  const createGridData = () => {
    const gridData: Record<string, { amnioticFluid: string; moulding: string }> = {};
    data.forEach((item, idx) => {
      const key = item.exactTime || String(idx);
      gridData[key] = {
        amnioticFluid: getAmnioticFluidInitials(item.amnioticFluid),
        moulding: getMouldingSymbol(item.moulding),
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
            <h3 className={styles.fetalHeartRateTitle}>Membrane Amniotic Fluid & Moulding</h3>
            <div className={styles.fetalHeartRateControls}>
              <span className={styles.legendText}>
                M=Membrane intact, C=Clear, MS=Meconium, A=Absent, B=Blood | 0, +, ++, +++
              </span>
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
                iconDescription="Add membrane amniotic fluid data"
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
              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('amnioticFluid', 'Amniotic Fluid')}</div>
                {timeColumns.map((timeColumn) => {
                  const cellData = gridData[timeColumn];
                  return (
                    <div key={`af-${timeColumn}`} className={styles.gridCell}>
                      {cellData?.amnioticFluid || ''}
                    </div>
                  );
                })}
              </div>

              <div className={styles.gridRow}>
                <div className={styles.gridRowLabel}>{t('moulding', 'Moulding')}</div>
                {timeColumns.map((timeColumn) => {
                  const cellData = gridData[timeColumn];
                  return (
                    <div key={`m-${timeColumn}`} className={styles.gridCell}>
                      {cellData?.moulding || ''}
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
                <DataTable
                  rows={paginatedData.map((row) => ({
                    ...row,
                    exactTime: row.exactTime,
                    amnioticFluid: getAmnioticFluidLabel(row.amnioticFluid),
                    moulding: getMouldingSymbol(row.moulding),
                  }))}
                  headers={tableHeaders}>
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
                <p>{t('noDataAvailable', 'No data available for membrane amniotic fluid & moulding')}</p>
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

export default MembraneAmnioticFluidGraph;
