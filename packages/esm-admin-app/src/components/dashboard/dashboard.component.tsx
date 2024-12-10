import React, { useState } from 'react';
import Header from '../header/header.component';
import { useTranslation } from 'react-i18next';
import { Layer, ComboButton, MenuItem, InlineLoading } from '@carbon/react';
import styles from './dashboard.scss';
import { recreateTables, refreshTables, recreateDatatools, refreshDwapi } from '../logs-table/operation-log-resource';
import LogTable from '../logs-table/operation-log-table.component';
import { showSnackbar } from '@openmrs/esm-framework';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [logData, setLogData] = useState<Array<any>>([]);

  const handleOperation = async (operation: () => Promise<any>, operationName: string) => {
    setIsLoading(true);
    setCurrentOperation(operationName);
    try {
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

      setLogData(data);
    } catch (error) {
      console.error(`Error during ${operationName}`, error);
      showSnackbar({
        title: t('operationError', '{{operationName}} failed', { operationName }),
        subtitle: t('operationErrorSubtitle', 'An error occurred during the operation.'),
        kind: 'error',
        isLowContrast: true,
      });
    } finally {
      setIsLoading(false);
      setCurrentOperation('');
    }
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
              onClick={() => handleOperation(refreshTables, t('refreshTables', 'Refresh tables'))}
            />
            <MenuItem
              label={t('recreateTables', 'Recreate tables')}
              onClick={() => handleOperation(recreateTables, t('recreateTables', 'Recreate tables'))}
            />
            <MenuItem
              label={t('recreateDatatools', 'Recreate datatools')}
              onClick={() => handleOperation(recreateDatatools, t('recreateDatatools', 'Recreate datatools'))}
            />
            <MenuItem
              label={t('refreshDwapi', 'Refresh DWAPI tables')}
              onClick={() => handleOperation(refreshDwapi, t('refreshDwapi', 'Refresh DWAPI tables'))}
            />
          </ComboButton>
        )}
      </Layer>

      <Layer className={styles.tableLayer}>
        <LogTable logData={logData} isLoading={isLoading} />
      </Layer>
    </div>
  );
};

export default Dashboard;
