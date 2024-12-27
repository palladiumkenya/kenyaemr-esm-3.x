import React from 'react';
import styles from './summary.scss';
import Encounter from '../encounters/encounter.component';
import { useTranslation } from 'react-i18next';

type SummaryProps = {};

const Summary: React.FC<SummaryProps> = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <h4>{t('screening', 'Screening')}</h4>
          <div>
            <h6>{t('totalCrossBorderScreening', 'Total cross border screening')}</h6>
            <p>10</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <h4>{t('referral', 'Referral')}</h4>
          <div>
            <h6>{t('totalCrossBorderReferral', 'Total cross border referral')}</h6>
            <p>30</p>
          </div>
        </div>
      </div>
      <Encounter />
    </>
  );
};

export default Summary;
