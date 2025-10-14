import React from 'react';
import { HomePictogram, PageHeader } from '@openmrs/esm-framework';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import BillDepositSearch from '../search/bill-deposit-search.component';

import styles from '../../styles/bill-deposit-dashboard.scss';

const BillDepositDashboard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader
        className={styles.billDepositDashboard}
        title={t('billDeposit', 'Bill Deposit')}
        illustration={<HomePictogram />}
      />
      <div className={styles.tabsContainer}>
        <Tabs>
          <TabList contained>
            <Tab renderIcon={Search}>{t('search', 'Search')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <BillDepositSearch />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default BillDepositDashboard;
