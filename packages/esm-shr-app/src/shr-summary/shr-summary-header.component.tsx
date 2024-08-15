import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './shr-summary.scss';

interface SHRSummaryHeaderProps {}

const SHRSummaryHeader: React.FC<SHRSummaryHeaderProps> = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.headerContainer}>
      <h4>{t('shrPortal', 'SHR Portal')}</h4>
    </div>
  );
};

export default SHRSummaryHeader;
