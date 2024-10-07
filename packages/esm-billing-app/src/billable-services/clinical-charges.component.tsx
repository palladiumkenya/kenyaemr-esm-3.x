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
      <TabList aria-label={t('chargeItems', 'Charge Items')} contained>
        <Tab
          className={styles.tabHeader}
          renderIcon={Task}
          secondaryLabel={t('chargeItemsDescription', 'Charge Items and Services Dashboard')}>
          {t('chargeItems', 'Charge Items')}
        </Tab>
      </TabList>
      <TabPanels>
        <ChargeSummaryTable />
      </TabPanels>
    </Tabs>
  );
};

export default ClinicalCharges;
