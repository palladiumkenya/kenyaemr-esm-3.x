import React from 'react';
import Header from '../header/header.component';
import { useTranslation } from 'react-i18next';
import { Layer, ComboButton, MenuItem } from '@carbon/react';
import styles from './dashboard.scss';
import LogTable from '../logs-table/operation-log-table.component';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <Header title={t('home', 'Home')} />
      <Layer className={styles.btnLayer}>
        <ComboButton tooltipAlignment="left" label={t('etlOperation', 'ETL operations')} size="md">
          <MenuItem label={t('refreshTables', 'Refresh tables')} />
          <MenuItem label={t('recreateTables', 'Recreate tables')} />
          <MenuItem label={t('recreateDatatools', 'Recreate datatools')} />
          <MenuItem label={t('refreshDwapi', 'Refresh DWAPI tables')} />
        </ComboButton>
      </Layer>
      <Layer className={styles.tableLayer}>
        <LogTable />
      </Layer>
    </div>
  );
};

export default Dashboard;
