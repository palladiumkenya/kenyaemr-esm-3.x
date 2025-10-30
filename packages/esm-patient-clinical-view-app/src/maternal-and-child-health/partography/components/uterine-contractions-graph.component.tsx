import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SkeletonText } from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import styles from '../partography.scss';
import UterineContractionsTable from '../table/uterine-contractions-table.component';

interface UterineContractionsTableRow {
  id: string;
  date: string;
  timeSlot: string;
  contractionCount: string;
  contractionLevel: string;
  protein?: string;
  acetone?: string;
  volume?: string;
}

interface UterineContractionsGraphProps {
  tableData: UterineContractionsTableRow[];
  viewMode: 'graph' | 'table';
  currentPage: number;
  pageSize: number;
  totalItems: number;
  controlSize: 'sm' | 'md';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAddData?: () => void;
  onViewModeChange?: (mode: 'graph' | 'table') => void;
  isAddButtonDisabled?: boolean;
  isLoading?: boolean;
}

const UterineContractionsGraph: React.FC<UterineContractionsGraphProps> = ({
  tableData,
  viewMode,
  currentPage,
  pageSize,
  totalItems,
  controlSize,
  onPageChange,
  onPageSizeChange,
  onAddData,
  onViewModeChange,
  isAddButtonDisabled = false,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const filteredTableData = tableData.filter((item) => item.date && item.timeSlot);
  const timeColumns = filteredTableData.map((item) => item.timeSlot || '--');
  const yAxisLabels = ['5', '4', '3', '2', '1'];

  const renderSkeleton = () => (
    <div className={styles.membraneGrid}>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>
          <div className={styles.gridCell}>
            <SkeletonText width="60px" />
          </div>
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className={styles.gridCell}>
              <SkeletonText width="60px" />
            </div>
          ))}
        </div>
        <div className={styles.gridRow}>
          <div className={styles.gridRowLabel}>
            <SkeletonText width="80px" />
          </div>
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className={styles.gridCell}>
              <SkeletonText width="40px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Empty state for no data
  const renderEmptyGraph = () => (
    <div className={styles.membraneGrid}>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>
          <div className={styles.gridCell}>{t('time', 'Time')}</div>
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className={styles.gridCell}>
              --
            </div>
          ))}
        </div>
        <div className={styles.gridRow}>
          <div className={styles.gridRowLabel}>{t('contractions', 'Contractions')}</div>
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className={styles.gridCell}>
              --
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', width: '100%' }}>
          <p>{t('noContractionData', 'No contraction data available')}</p>
          <Button kind="primary" size={controlSize} renderIcon={Add} onClick={onAddData}>
            {t('addFirstDataPoint', 'Add first data point')}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.fetalHeartRateSection}>
      <div className={styles.fetalHeartRateContainer}>
        <div className={styles.fetalHeartRateHeader}>
          <div className={styles.fetalHeartRateHeaderLeft}>
            <h3 className={styles.fetalHeartRateTitle}>Uterine Contractions</h3>
            <div className={styles.fetalHeartRateControls}>
              <span className={styles.legendText}>
                {}
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
                iconDescription="Add uterine contractions data"
                disabled={isAddButtonDisabled}
                onClick={onAddData}
                className={styles.addButton}>
                Add
              </Button>
            </div>
          </div>
        </div>
        {viewMode === 'graph' ? (
          isLoading ? (
            renderSkeleton()
          ) : filteredTableData.length === 0 ? (
            renderEmptyGraph()
          ) : (
            <div className={styles.membraneGrid}>
              <div className={styles.gridContainer}>
                <div className={styles.gridHeader}>
                  <div className={styles.gridCell}>{t('time', 'Time')}</div>
                  {timeColumns.map((timeColumn, idx) => (
                    <div key={idx} className={styles.gridCell}>
                      {timeColumn}
                    </div>
                  ))}
                </div>
                <div className={styles.gridRow}>
                  <div className={styles.gridRowLabel}>{t('contractions', 'Contractions')}</div>
                  {filteredTableData.map((item, idx) => {
                    const rawLevel = (item.contractionLevel || '').toLowerCase();

                    const getContractionLevel = (level) => {
                      if (level === '0' || level === 'none') {
                        return 'none';
                      }
                      if (level === '1' || level === 'mild') {
                        return 'mild';
                      }
                      if (level === '2' || level === 'moderate') {
                        return 'moderate';
                      }
                      if (level === '3' || level === '5' || level === 'strong') {
                        return 'strong';
                      }
                      return 'none';
                    };

                    const contractionLevel = getContractionLevel(rawLevel);

                    return (
                      <div
                        key={`contraction-${idx}`}
                        className={`${styles.gridCell} contractionsGridCell`}
                        data-contraction-level={contractionLevel}>
                        {item.contractionCount !== undefined && item.contractionCount !== null
                          ? item.contractionCount
                          : '--'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className={styles.tableContainer}>
            <UterineContractionsTable
              tableData={filteredTableData}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredTableData.length}
              controlSize={controlSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UterineContractionsGraph;
