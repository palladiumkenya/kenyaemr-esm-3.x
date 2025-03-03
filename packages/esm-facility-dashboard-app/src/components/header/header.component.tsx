import { Calendar, Location } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FacilityDashboardIllustration from './header-illustration.component';
import styles from './header.scss';

const FacilityDashboardHeader: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;
  return (
    <div className={styles.header}>
      <div className={styles.leftJustifiedItems}>
        <FacilityDashboardIllustration />
        <div className={styles.pageLabels}>
          <p>{t('facilitydashboard', 'Facility Dashboard')}</p>
          <p className={styles.pageName}>{title}</p>
        </div>
      </div>
      <div className={styles.rightJustifiedItems}>
        <div className={styles.dateAndLocation}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};

export default FacilityDashboardHeader;
