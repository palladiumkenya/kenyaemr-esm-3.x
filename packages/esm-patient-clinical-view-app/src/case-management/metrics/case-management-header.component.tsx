import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WatsonHealthStressBreathEditor } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import styles from './case-management-header.scss';
import { launchWorkspace, navigate, useSession } from '@openmrs/esm-framework';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const { user } = useSession();
  const metricsTitle = t(' ', 'Case Manager');
  const handleAddCase = () => {
    launchWorkspace('case-management-form', {
      workspaceTitle: 'Case Management Form',
    });
  };
  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}> </span>
      <div className={styles.actionBtn}>
        <Button
          kind="tertiary"
          renderIcon={(props) => <WatsonHealthStressBreathEditor size={16} {...props} />}
          iconDescription={t('addCases', 'Add a case')}
          onClick={handleAddCase}>
          {t('addCases', 'Add a case')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
