import React, { useState } from 'react';
import Header from '../header/header.component';
import { useTranslation } from 'react-i18next';
import { Layer, ComboButton, MenuItem, InlineLoading } from '@carbon/react';
import styles from './dashboard.scss';
import { recreateTables, refreshTables, recreateDatatools, refreshDwapi } from '../logs-table/operation-log-resource';
import LogTable from '../logs-table/operation-log-table.component';
import { showModal, showSnackbar } from '@openmrs/esm-framework';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [logData, setLogData] = useState<Array<any>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const openConfirmationModal = (
    operation: () => Promise<any>,
    operationName: string,
    clearDataOnRecreate: boolean = false,
  ) => {
    const dispose = showModal('operation-confirmation-modal', {
      confirm: async () => {
        dispose();
        setIsLoading(true);
        setCurrentOperation(operationName);
        if (clearDataOnRecreate) {
          setLogData([]);
        }

        try {
          setIsRefreshing(operationName === 'refreshTables');

          const data = await operation();
          const isRecreate = operationName.toLowerCase().includes('recreate');
          const operationType = isRecreate ? t('recreated', 'recreated') : t('refreshed', 'refreshed');

          showSnackbar({
            title: t('operationSuccess', '{{operationName}} successfully {{operationType}}', {
              operationName,
              operationType,
            }),
            subtitle: t('operationSuccessSubtitle', 'The operation completed successfully.'),
            kind: 'success',
            isLowContrast: true,
          });

          if (operationName === 'refreshTables') {
            setLogData((prevData) => [...prevData, ...data]);
          } else {
            setLogData(data);
          }
        } catch (error) {
          showSnackbar({
            title: t('operationError', '{{operationName}} failed', { operationName }),
            subtitle: t('operationErrorSubtitle', 'An error occurred during the operation.'),
            kind: 'error',
            isLowContrast: true,
          });
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          setCurrentOperation('');
        }
      },
      close: () => {
        dispose();
      },
      operationName,
      operationType: operationName,
    });
  };

  return (
    <div className="omrs-main-content">
      <Header title={t('home', 'Home')} />
      <Layer className={styles.btnLayer}>
        {isLoading ? (
          <InlineLoading
            description={t('etlOperationLoading', `Please wait, ${currentOperation} is in progress...`)}
            size="md"
            className={styles.loading}
            withOverlay
          />
        ) : (
          <ComboButton tooltipAlignment="left" label={t('etlOperation', 'ETL operations')} size="md">
            <MenuItem
              label={t('refreshTables', 'Refresh tables')}
              onClick={() => openConfirmationModal(refreshTables, t('refreshTables', 'Refresh tables'), false)} // Preserve existing rows during refresh
            />
            <MenuItem
              label={t('recreateTables', 'Recreate tables')}
              onClick={() => openConfirmationModal(recreateTables, t('recreateTables', 'Recreate tables'), true)} // Clear data for recreate operation
            />
            <MenuItem
              label={t('recreateDatatools', 'Recreate datatools')}
              onClick={() =>
                openConfirmationModal(recreateDatatools, t('recreateDatatools', 'Recreate datatools'), true)
              } // Clear data for recreate operation
            />
            <MenuItem
              label={t('refreshDwapi', 'Refresh DWAPI tables')}
              onClick={() => openConfirmationModal(refreshDwapi, t('refreshDwapi', 'Refresh DWAPI tables'), false)} // Preserve existing rows during refresh
            />
          </ComboButton>
        )}
      </Layer>
      <Layer className={styles.tableLayer}>
        <LogTable logData={logData} isLoading={isRefreshing} /> {/* Pass refresh state for conditional loading */}
      </Layer>
    </div>
  );
};

export default Dashboard;
