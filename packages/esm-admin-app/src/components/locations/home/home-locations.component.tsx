import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../header/header.component';
import LocationsTable from '../tables/locations-table.component';
import styles from './home-locations.scss';
const HomeComponent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Header title={t('locations', 'Locations')} />
      <div className={styles.tableContainer}>
        <LocationsTable />
      </div>
    </div>
  );
};

export default HomeComponent;
