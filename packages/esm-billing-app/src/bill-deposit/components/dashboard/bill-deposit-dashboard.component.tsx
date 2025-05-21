import React from 'react';
import { HomePictogram, PageHeader, PageHeaderContent } from '@openmrs/esm-framework';
import styles from '../../styles/bill-deposit-dashboard.scss';
import { Tabs, TabList, Tab, TabPanels, TabPanel, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import BillDepositSearch from '../search/bill-deposit-search.component';

const BillDepositDashboard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader className={styles.billDepositDashboard}>
        <PageHeaderContent title="Bill Deposit" illustration={<HomePictogram />} />
        <OverflowMenu flipped aria-label="overflow-menu">
          <OverflowMenuItem itemText={t('addDeposit', 'Add Deposit')} />
        </OverflowMenu>
      </PageHeader>
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
