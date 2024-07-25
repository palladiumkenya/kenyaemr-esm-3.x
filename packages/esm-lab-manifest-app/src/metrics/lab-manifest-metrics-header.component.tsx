import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './lab-manifest-header.scss';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('labManifestSummary', 'Lab Manifest Summary');

  const handleAddLabManifest = () => {
    launchWorkspace('lab-manifest-form', {
      workspaceTitle: 'Lab Manifest Form',
    });
  };

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <div className={styles.actionBtn}>
        <Button
          kind="tertiary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          iconDescription={t('addNewManifest', 'Add new Manifest')}
          onClick={handleAddLabManifest}>
          {t('addNewManifest', 'Add new Manifest')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
