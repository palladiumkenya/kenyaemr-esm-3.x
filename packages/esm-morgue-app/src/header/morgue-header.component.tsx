import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate } from '@openmrs/esm-framework';
import styles from './morgue-header.scss';
import MorgueIllustration from './morgue-illustration.component';
import { InlineLoading } from '@carbon/react';

interface MorgueHeaderProps {
  title: string;
  awaitingCount: number;
  admittedCount: number;
  dischargedCount: number;
  isLoading: boolean;
}

export const MorgueHeader: React.FC<MorgueHeaderProps> = ({
  title,
  awaitingCount,
  admittedCount,
  dischargedCount,
  isLoading,
}) => {
  const { t } = useTranslation();
  const renderMetricValue = (value: number) => {
    return isLoading ? (
      <span className={styles.loadingSpinner}>
        <InlineLoading />
      </span>
    ) : (
      <span className={styles.metricValue}>{value}</span>
    );
  };

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <MorgueIllustration />
        <div className={styles['page-labels']}>
          <p className={styles['page-name']}>{title}</p>
          <p>{t('mortuaryManagement', 'Mortuary management')}</p>
        </div>
      </div>
      <div className={styles.metrics}>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('awaiting', 'Awaiting')}</span>
          {renderMetricValue(awaitingCount)}
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('admittedOnes', 'Admitted')}</span>
          {renderMetricValue(admittedCount)}
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('discharges', 'Discharges')}</span>
          {renderMetricValue(dischargedCount)}
        </div>
      </div>
    </div>
  );
};
