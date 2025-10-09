import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import styles from '../partography.scss';

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
          <div className={styles.contractionsGrid}>
            <div className={styles.contractionsContainer}>
              {/* Grid Rows with Y-axis labels */}
              {yAxisLabels.map((label, rowIndex) => (
                <div key={label} className={styles.contractionsGridRow}>
                  <div className={styles.contractionsYAxisLabel}>{label}</div>
                  {Array.from({ length: 13 }, (_, colIndex) => {
                    // Find data for this time slot
                    const dataForTimeSlot = data?.find((item, index) => index === colIndex);
                    const yPosition = parseInt(label); // Convert label to number (5,4,3,2,1)
                    const contractionCount = dataForTimeSlot ? parseInt(dataForTimeSlot.contractionCount) : 0;
                    const contractionLevel = dataForTimeSlot?.contractionLevel || 'none';

                    // Determine if this cell should be filled
                    // Fill from bottom up: if we have 3 contractions, fill positions 1, 2, and 3
                    const shouldFill = contractionCount > 0 && yPosition <= contractionCount;

                    // Get color class based on contraction level
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
                        data-level={contractionLevel}>
                        {/* Visual bar indicator for filled cells */}
                        {shouldFill && (
                          <div className={`${styles.contractionBar} ${styles[getColorClass(contractionLevel)]}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Y-Axis Title */}
              <div className={styles.contractionsYAxisTitle}>
                <span>{t('contractionsPerTenMin', 'Contractions per 10 min')}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            {tableData && tableData.length > 0 ? (
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
                    {tableData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.timeSlot}</td>
                        <td>{row.contractionCount}</td>
                        <td>
                          <span
                            className={`${styles.contractionLevelBadge} ${styles[row.contractionLevel.toLowerCase()]}`}>
                            {row.contractionLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
