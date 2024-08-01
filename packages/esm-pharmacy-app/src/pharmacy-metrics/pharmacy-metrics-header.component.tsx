import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './pharmacy-header.scss';

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('pharmacySummary', 'Pharmacy Summary');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const filterItems = (menu) => {
    return menu?.item?.toLowerCase().includes(menu?.inputValue?.toLowerCase());
  };

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <div className={styles.actionBtn}>
        <Button
          kind="tertiary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          iconDescription={t('tagPharmacy', 'Tag pharmacy')}>
          {t('tagPharmacy', 'Tag pharmacy')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
