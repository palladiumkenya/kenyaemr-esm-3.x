import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import DrugsIVFluidsGraph, { DrugsIVFluidsData } from './drugs-iv-fluids-graph.component';
import DrugsIVFluidsForm from '../forms/drugs-iv-fluids-form.component';
import styles from '../partography.scss';

interface DrugsIVFluidsGraphWrapperProps {
  data: DrugsIVFluidsData[];
  tableData?: Array<{
    date: string;
    drugName: string;
    dosage: string;
    route?: string;
    frequency?: string;
    source?: string;
  }>;
  viewMode?: 'graph' | 'table';
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  controlSize?: 'sm' | 'md' | 'lg';
  onAddData?: () => void;
  onViewModeChange?: (mode: 'graph' | 'table') => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isAddButtonDisabled?: boolean;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
  onDrugsIVFluidsSubmit?: (data: { drugName: string; dosage: string; route: string; frequency: string }) => void;
  onDataSaved?: () => void;
}

const DrugsIVFluidsGraphWrapper: React.FC<DrugsIVFluidsGraphWrapperProps> = ({
  data = [],
  tableData = [],
  viewMode = 'graph',
  controlSize = 'sm',
  onAddData,
  onViewModeChange,
  isAddButtonDisabled = false,
  patient,
  onDrugsIVFluidsSubmit,
  onDataSaved,
}) => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddData = () => {
    setIsFormOpen(true);
    onAddData?.();
  };

  const handleFormSubmit = (formData: { drugName: string; dosage: string; route: string; frequency: string }) => {
    onDrugsIVFluidsSubmit?.(formData);
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  return (
    <div className={styles.fetalHeartRateSection}>
      <div className={styles.fetalHeartRateContainer}>
        <div className={styles.fetalHeartRateHeader}>
          <div className={styles.fetalHeartRateTitle}>
            <h3 className={styles.fetalHeartRateHeading}>{t('drugsAndIVFluidsGiven', 'Drugs given and IV fluids')}</h3>
          </div>
          <div className={styles.fetalHeartRateControls}>
            <div className={styles.viewToggle}>
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
              iconDescription="Add drugs and IV fluids data"
              disabled={isAddButtonDisabled}
              onClick={handleAddData}
              className={styles.addButton}>
              Add
            </Button>
          </div>
        </div>

        {viewMode === 'graph' ? (
          <DrugsIVFluidsGraph data={data} />
        ) : (
          <div className={styles.tableContainer}>
            {tableData && tableData.length > 0 ? (
              <div className={styles.drugsIVFluidsTable}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>{t('date', 'Date')}</th>
                      <th>{t('drugName', 'Drug Name')}</th>
                      <th>{t('dosage', 'Dosage')}</th>
                      <th>{t('route', 'Route')}</th>
                      <th>{t('frequency', 'Frequency')}</th>
                      <th>{t('source', 'Source')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{item.drugName}</td>
                        <td>{item.dosage}</td>
                        <td>{item.route || '-'}</td>
                        <td>{item.frequency || '-'}</td>
                        <td>
                          <span className={item.source === 'order' ? styles.orderSource : styles.manualSource}>
                            {item.source === 'order' ? t('drugOrder', 'Drug Order') : t('manual', 'Manual')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyTable}>
                <p>{t('noDrugsIVFluidsData', 'No drugs and IV fluids data available')}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <DrugsIVFluidsForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        patient={patient}
        onDataSaved={onDataSaved}
      />
    </div>
  );
};

export default DrugsIVFluidsGraphWrapper;
