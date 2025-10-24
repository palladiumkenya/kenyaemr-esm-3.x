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
  Tag,
} from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import styles from '../partography.scss';
import OxytocinGraphComponent from './oxytocin-graph.component';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

export interface OxytocinData {
  timeSlot: string;
  oxytocinUsed: 'yes' | 'no';
  dropsPerMinute: number;
  date?: string;
  id?: string;
}

interface OxytocinGraphProps {
  data: OxytocinData[];
  tableData: any[];
  viewMode: 'graph' | 'table';
  currentPage: number;
  pageSize: number;
  totalItems: number;
  controlSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onAddData: () => void;
  onViewModeChange: (mode: 'graph' | 'table') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isAddButtonDisabled: boolean;
}

const OxytocinGraph: React.FC<OxytocinGraphProps> = ({
  data,
  tableData,
  viewMode,
  currentPage,
  pageSize,
  totalItems,
  controlSize,
  onAddData,
  onViewModeChange,
  onPageChange,
  onPageSizeChange,
  isAddButtonDisabled,
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
    { key: 'timeSlot', header: t('time', 'Time') },
    { key: 'oxytocinUsed', header: t('oxytocinUsed', 'Oxytocin Used') },
    { key: 'dropsPerMinute', header: t('dropsPerMinute', 'Drops per Minute') },
  ];

  return (
    <div className={styles.graphContainer}>
      <div className={styles.graphHeader}>
        <div className={styles.graphHeaderLeft}>
          <h6>{t('oxytocinAdministration', 'Oxytocin Administration')}</h6>
          <Tag type="outline">{t('oxytocinRange', '0-60 drops/min')}</Tag>
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
          <Button kind="primary" size={controlSize} renderIcon={Add} onClick={onAddData} disabled={isAddButtonDisabled}>
            {t('add', 'Add')}
          </Button>
        </div>
      </div>
      <p className={styles.graphDescription}>
        {t('oxytocinDescription', 'Track oxytocin administration and drops per minute over time')}
      </p>

      {viewMode === 'graph' ? (
        <div className={styles.chartContainer}>
          <OxytocinGraphComponent data={data} />
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
                  pageSizes={calculatedPageSizes}
                  onChange={(event) => {
                    onPageChange(event.page);
                    if (event.pageSize !== pageSize) {
                      onPageSizeChange(event.pageSize);
                    }
                  }}
                  size={controlSize as 'sm' | 'md' | 'lg'}
                />
              )}
              {totalItems > 0 && <div className={styles.paginationInfo}>{itemsDisplayed}</div>}
              <div className={styles.tableStats}>
                <span className={styles.recordCount}>
                  {t('showingResults', 'Showing {{start}}-{{end}} of {{total}} {{itemType}}', {
                    start: totalItems === 0 ? 0 : startIndex + 1,
                    end: Math.min(endIndex, totalItems),
                    total: totalItems,
                    itemType: totalItems === 1 ? t('record', 'record') : t('records', 'records'),
                  })}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>{t('noOxytocinData', 'No oxytocin data available')}</p>
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

export default OxytocinGraph;
