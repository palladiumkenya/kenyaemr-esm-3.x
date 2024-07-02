import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './metrics-header.scss';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('claimSummary', 'Claim Summary');

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
    </div>
  );
};

export default MetricsHeader;
