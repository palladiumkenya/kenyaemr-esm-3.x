import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate } from '@openmrs/esm-framework';
import styles from './providers-header.scss';
import ProvidersIllustration from './providers-illustration.component';

interface ProviderHeaderProps {
  title: string;
}
export const ProvidersHeader: React.FC<ProviderHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <ProvidersIllustration />
        <div className={styles['page-labels']}>
          <p className={styles['page-name']}>{title}</p>
          <p>{t('providerManagement', 'Providers Management')}</p>
        </div>
      </div>
      <div className={styles.metrics}>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('all', 'All')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('active', 'Active')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('licenceDue', 'License(s) due')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('expired', 'Expired License(s)')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <div className={styles.metricLocationDate}>
            <span className={styles.location}>
              <Location size={16} /> {userLocation}
            </span>
            <span className={styles.date}>
              <Calendar size={16} /> {formatDate(new Date(), { mode: 'standard' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
