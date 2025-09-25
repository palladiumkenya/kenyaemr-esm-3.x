import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate, ExtensionSlot } from '@openmrs/esm-framework';
import styles from './referrals-header.scss';
import ReferralsIllustration from './referrals-illustration.component';

export const ReferralsHeader: React.FC = () => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <ReferralsIllustration />
        <div className={styles['page-labels']}>
          <p>{t('facilityWide', 'Facility Wide')}</p>
          <p className={styles['page-name']}>{t('referrals', 'Referrals')}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <ExtensionSlot name="provider-banner-info-slot" />
      </div>
    </div>
  );
};
