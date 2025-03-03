import { Button, Layer } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FacilityDashboardHeader from '../components/header/header.component';
import { FacilityDashboardConfigObject } from '../config-schema';
import styles from './above-site.scss';

const AboveSiteDashboard = () => {
  const { t } = useTranslation();
  const { facilityDashboardAboveSiteUrl } = useConfig<FacilityDashboardConfigObject>();
  return (
    <Layer>
      <FacilityDashboardHeader title={t('aboveSiteFacilityDashboard', 'Above site facility Dashboard')} />

      <Button
        className={styles.supersetBtn}
        onClick={() => {
          window.open(facilityDashboardAboveSiteUrl, '_blank');
        }}>
        {t('viewOnSuperset', 'View on Superset')}
      </Button>

      <iframe
        className={styles.dashboard}
        src={`${facilityDashboardAboveSiteUrl}?standalone=true`}
        title={t('aboveSiteDashboard', 'Above Site Dashboard')}></iframe>
    </Layer>
  );
};

export default AboveSiteDashboard;
