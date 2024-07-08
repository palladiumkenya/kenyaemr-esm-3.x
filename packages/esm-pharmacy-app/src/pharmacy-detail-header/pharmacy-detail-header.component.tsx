import React from 'react';
import styles from '../pharmacy-header/pharmacy-header.scss';
import { Calendar, Location } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { usePharmacy } from '../hooks';
import { useParams } from 'react-router-dom';
import { SkeletonText } from '@carbon/react';

const PharmacyDetailHeader = () => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;
  const { pharmacyUuid } = useParams();
  const { error, isLoading, pharmacy } = usePharmacy(pharmacyUuid);

  if (isLoading) {
    return <SkeletonText style={{ height: '40px' }} />;
  }
  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <div className={styles['page-labels']}>
          <p>{t('pharmacy', 'Community pharmacy')}</p>
          <p className={styles['page-name']}>{pharmacy.name}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
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

export default PharmacyDetailHeader;
