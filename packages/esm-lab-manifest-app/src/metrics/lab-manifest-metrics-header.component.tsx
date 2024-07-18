/* eslint-disable no-console */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@carbon/react/icons';
import styles from './lab-manifest-header.scss';
import { Button, TextInput, Modal, Select, ComboBox, SelectItem, DatePickerInput, DatePicker } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('labManifestSummary', 'Lab Manifest Summary');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const filterItems = (menu) => {
    return menu?.item?.toLowerCase().includes(menu?.inputValue?.toLowerCase());
  };

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
