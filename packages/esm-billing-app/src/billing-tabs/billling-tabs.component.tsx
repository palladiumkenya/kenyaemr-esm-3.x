import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { List, Search, BaggageClaim, TwoFactorAuthentication } from '@carbon/react/icons';

import BillsTable from '../bills-table/bills-table.component';
import PatientBillsScreen from '../past-patient-bills/patient-bills-dashboard/patient-bills-dashboard';
import ClaimsManagementTable from '../claims/claims-management/table/claims-list-table.component';
import PreauthTableTemporary from '../claims/claims-management/table/preauth-table.tmp.component';

import styles from './billing-tabs.scss';

const BillingTabs = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.tabsContainer} data-testid="BillingsList-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange}>
        <div style={{ display: 'flex' }}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label={t('billingTabs', 'Billing tabs')} contained>
            <Tab renderIcon={Search}>{t('patientBills', 'Patient Bills')}</Tab>
            <Tab renderIcon={List}>{t('billsToday', 'Bills Today')}</Tab>
            <Tab renderIcon={BaggageClaim}>{t('claims', 'Claims')}</Tab>
            <Tab renderIcon={TwoFactorAuthentication}>{t('preAuth', 'Pre-Authorization')}</Tab>
          </TabList>
        </div>
        <TabPanels>
          <TabPanel>
            <PatientBillsScreen />
          </TabPanel>
          <TabPanel>
            <BillsTable />
          </TabPanel>
          <TabPanel>
            <ClaimsManagementTable />
          </TabPanel>
          <TabPanel>
            <PreauthTableTemporary />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default BillingTabs;
