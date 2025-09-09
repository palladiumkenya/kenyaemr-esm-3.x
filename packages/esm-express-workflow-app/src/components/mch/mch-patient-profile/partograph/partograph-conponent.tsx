import { TabListVertical, TabPanels, TabsVertical } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './partograph.scss';
const Partograph = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.partographSignsArea}>
        <label className={styles.vitalsSignLabel} htmlFor="partography-chart-tab-group">
          {t('partographyDisplay', 'Partography Displayed')}
        </label>
        <TabsVertical height="">
          <TabListVertical></TabListVertical>

          <TabPanels></TabPanels>
        </TabsVertical>
      </div>
    </div>
  );
};

export default Partograph;
