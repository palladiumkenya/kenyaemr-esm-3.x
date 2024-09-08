import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Task } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './clinical-charges.scss';
import ChargeSummaryTable from './billables/charge-summary-table.component';

const ClinicalCharges = () => {
  const { t } = useTranslation();
  return (
    <Tabs>
      <TabList aria-label={t('priceManagement', 'Price management')} contained>
        <Tab
          className={styles.tabHeader}
          renderIcon={Task}
          secondaryLabel={t('clinicalChargesDescription', 'Billable services and consumable prices')}>
          {t('clinicalCharges', 'Medical Invoice Items')}
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ChargeSummaryTable />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default ClinicalCharges;
