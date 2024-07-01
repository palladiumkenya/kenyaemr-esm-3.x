import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WatsonHealthStressBreathEditor } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import styles from './case-management-header.scss';
import { navigate } from '@openmrs/esm-framework';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('caseManager', 'Case Manager summaries');
  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <div className={styles.actionBtn}>
        <Button
          kind="primary"
          renderIcon={(props) => <WatsonHealthStressBreathEditor size={16} {...props} />}
          iconDescription={t('enroll', 'Enroll a case')}>
          {t('enroll', 'Enroll a case')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
