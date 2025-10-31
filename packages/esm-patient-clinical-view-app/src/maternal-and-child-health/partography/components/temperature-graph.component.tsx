import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SkeletonText } from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import styles from '../partography.scss';
import TemperatureTable from '../table/temperature-table.component';

interface TemperatureTableRow {
  id: string;
  date: string;
  timeSlot: string;
  exactTime: string;
  temperature: number;
}

interface TemperatureGraphProps {
  tableData: TemperatureTableRow[];
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

const TemperatureGraph: React.FC<TemperatureGraphProps> = ({
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
  const filteredTableData = tableData.filter((item) => item.date && (item.exactTime || item.timeSlot));
  const timeColumns = filteredTableData.map((item) => item.exactTime || item.timeSlot || '--');

  const getTemperatureStatus = (temperature: number): string => {
    if (temperature < 36.1) {
      return styles.temperatureLow;
    }
    if (temperature >= 36.1 && temperature <= 37.2) {
      return styles.temperatureNormal;
    }
    if (temperature > 37.2) {
      return styles.temperatureHigh;
    }
    return '';
  };
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
          <div className={styles.gridRowLabel}>{t('temperature', 'Temp °C')}</div>
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className={styles.gridCell}>
              --
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', width: '100%' }}>
          <p>{t('noDataAvailable', 'No temperature data available')}</p>
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
          isLoading ? (
            renderSkeleton()
          ) : filteredTableData.length === 0 ? (
            renderEmptyGraph()
          ) : (
            <div className={styles.membraneGrid}>
              <div className={styles.gridContainer}>
                {/* Header row with time columns */}
                <div className={styles.gridHeader}>
                  <div className={styles.gridCell}>{t('time', 'Time')}</div>
                  {timeColumns.map((timeColumn, idx) => (
                    <div key={idx} className={styles.gridCell}>
                      {timeColumn}
                    </div>
                  ))}
                </div>
                {/* Temperature row */}
                <div className={styles.gridRow}>
                  <div className={styles.gridRowLabel}>{t('temperature', 'Temp °C')}</div>
                  {filteredTableData.map((item, idx) => (
                    <div
                      key={`temp-${idx}`}
                      className={`${styles.gridCell} ${
                        item.temperature ? getTemperatureStatus(item.temperature) : ''
                      }`}>
                      {item.temperature !== undefined && item.temperature !== null ? item.temperature : '--'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className={styles.tableContainer}>
            <TemperatureTable
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

export default TemperatureGraph;
