import React from 'react';
import { Pagination, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import styles from '../partography.scss';
import { usePaginationInfo } from '@openmrs/esm-patient-common-lib';

interface CervicalContractionsData {
  timeSlot: string;
  contractionLevel: string;
  contractionCount: string;
  date?: string;
  id?: string;
}

interface TableData {
  id: string;
  date: string;
  timeSlot: string;
  contractionCount: string;
  contractionLevel: string;
}

interface Patient {
  uuid: string;
  name: string;
  gender: string;
  age: string;
}

interface CervicalContractionsGraphProps {
  data?: CervicalContractionsData[];
  tableData?: TableData[];
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
  patient?: Patient;
}

const CervicalContractionsGraph: React.FC<CervicalContractionsGraphProps> = ({
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
  isAddButtonDisabled = false,
  patient,
}) => {
  const { t } = useTranslation();

  const paginatedTableData =
    viewMode === 'table' && tableData && tableData.length > 0
      ? tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : tableData;

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return '';
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  const yAxisLabels = ['5', '4', '3', '2', '1'];
  return (
    <div className={styles.fetalHeartRateSection}>
      <div className={styles.fetalHeartRateContainer}>
        <div className={styles.fetalHeartRateHeader}>
          <div className={styles.fetalHeartRateHeaderLeft}>
            <h3 className={styles.fetalHeartRateTitle}>Cervical Contractions</h3>
            <div className={styles.fetalHeartRateControls}>
              <span className={styles.legendText}>
                Contractions per 10 min | Bar Heights: 0=None, 2=Mild, 3=Moderate, 5=Strong
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
                iconDescription="Add cervical contractions data"
                disabled={isAddButtonDisabled}
                onClick={() => onAddData?.()}
                className={styles.addButton}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'graph' ? (
          <div className={styles.contractionsGrid} style={{ overflowX: 'auto', width: '100%' }}>
            <div
              className={styles.contractionsContainer}
              style={{ minWidth: Math.max(1100, 70 * Math.max(13, data.length) + 60) }}>
              <div className={styles.contractionsTimeHeaders} style={{ display: 'flex' }}>
                <div className={styles.contractionsYAxisLabel} style={{ minWidth: 60, fontWeight: 600 }}>
                  {t('time', 'Time')}
                </div>
                {Array.from({ length: Math.max(13, data.length) }, (_, colIndex) => (
                  <div
                    key={`header-${colIndex}`}
                    className={styles.contractionsTimeHeader}
                    style={{ minWidth: 70, textAlign: 'center', fontWeight: 600 }}>
                    {data[colIndex]?.timeSlot || ''}
                  </div>
                ))}
              </div>
              {yAxisLabels.map((label, rowIndex) => (
                <div key={label} className={styles.contractionsGridRow} style={{ display: 'flex' }}>
                  <div className={styles.contractionsYAxisLabel} style={{ minWidth: 60 }}>
                    {label}
                  </div>
                  {Array.from({ length: Math.max(13, data.length) }, (_, colIndex) => {
                    const dataForTimeSlot = data?.[colIndex];
                    const yPosition = parseInt(label);
                    const contractionCount = dataForTimeSlot ? parseInt(dataForTimeSlot.contractionCount) : 0;
                    const contractionLevel = dataForTimeSlot?.contractionLevel || 'none';

                    const shouldFill = contractionCount > 0 && yPosition <= contractionCount;

                    const getColorClass = (level: string) => {
                      switch (level) {
                        case 'mild':
                          return 'contractionBarMild';
                        case 'moderate':
                          return 'contractionBarModerate';
                        case 'strong':
                          return 'contractionBarStrong';
                        default:
                          return 'contractionBarNone';
                      }
                    };

                    return (
                      <div
                        key={`${label}-${colIndex}`}
                        className={`${styles.contractionsGridCell} ${
                          shouldFill ? styles[getColorClass(contractionLevel)] : ''
                        }`}
                        data-y={label}
                        data-x={colIndex}
                        data-filled={shouldFill}
                        data-count={contractionCount}
                        data-level={contractionLevel}
                        style={{ minWidth: 70 }}>
                        {shouldFill && (
                          <div className={`${styles.contractionBar} ${styles[getColorClass(contractionLevel)]}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className={styles.contractionsYAxisTitle}>
                <span>{t('contractionsPerTenMin', 'Contractions per 10 min')}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            {tableData && tableData.length > 0 ? (
              <>
                <div className={styles.contractionsTable}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>{t('date', 'Date')}</th>
                        <th>{t('timeSlot', 'Time Slot')}</th>
                        <th>{t('contractionCount', 'Number of Contractions')}</th>
                        <th>{t('contractionLevel', 'Contraction Level')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTableData.map((row) => (
                        <tr key={row.id}>
                          <td>{formatDate(row.date)}</td>
                          <td>{row.timeSlot}</td>
                          <td>{row.contractionCount}</td>
                          <td>{row.contractionLevel || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(() => {
                  const totalPages = Math.ceil((totalItems || 0) / (pageSize || 1)) || 1;
                  const { pageSizes: calculatedPageSizes, itemsDisplayed } = usePaginationInfo(
                    pageSize,
                    totalPages,
                    currentPage,
                    totalItems || 0,
                  );

                  return (
                    <>
                      <Pagination
                        page={currentPage}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        pageSizes={calculatedPageSizes}
                        onChange={({ page, pageSize: newSize }) => {
                          onPageChange?.(page);
                          onPageSizeChange?.(newSize);
                        }}
                        size={controlSize}
                        className={styles.pagination}
                      />
                      <div className={styles.tableStats}>
                        <span className={styles.recordCount}>{itemsDisplayed}</span>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <div className={styles.emptyState}>
                <p>{t('noContractionData', 'No contraction data available')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CervicalContractionsGraph;
