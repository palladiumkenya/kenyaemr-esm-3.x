import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Button, MenuItem, InlineLoading } from '@carbon/react';
import styles from './facility-setup.scss';
import FacilityInfo from './facility-info.component';
import Header from './header/header.component';
import { showSnackbar } from '@openmrs/esm-framework';

const FacilitySetup: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="omrs-main-content">
      <Header title="Facility Setup" />

      <Layer className={styles.tableLayer}>
        <FacilityInfo />
      </Layer>
    </div>
  );
};

export default FacilitySetup;
