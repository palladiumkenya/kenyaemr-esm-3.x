import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { Task } from '@carbon/react/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChargeSummaryTable from './billables/charge-summary-table.component';
import styles from './clinical-charges.scss';

const ClinicalCharges = () => {
  const { t } = useTranslation();

  return (
    <Tabs>
      <div className={styles.tabWrapper}>
        <TabList aria-label={t('priceManagement', 'Price management')} contained>
          <Tab
            className={styles.tabHeader}
            renderIcon={Task}
            secondaryLabel={t('clinicalChargesDescription', 'Billable services and consumable prices')}>
            {t('clinicalCharges', 'Medical Invoice Items')}
          </Tab>
        </TabList>
      </div>
      <TabPanels>
        <TabPanel className={styles.tabPanel}>
          <ChargeSummaryTable />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default ClinicalCharges;
