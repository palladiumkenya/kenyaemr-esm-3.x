import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FacilityInfo from './facility-info.component';
import styles from './facility-setup.scss';
import Header from './header/header.component';

const FacilitySetup: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="omrs-main-content">
      <Header title={t('facilityDetails', 'Facility Details')} />

      <Layer className={styles.tableLayer}>
        <FacilityInfo />
      </Layer>
    </div>
  );
};

export default FacilitySetup;
