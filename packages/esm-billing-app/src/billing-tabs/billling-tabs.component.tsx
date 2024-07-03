import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import styles from './billing-tab.scss';
import PatientBillsScreen from '../past-patient-bills/patient-bills-dashboard/patient-bills-dashboard';
import BillsTable from '../bills-table/bills-table.component';

const BillingTabs = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.referralsList} data-testid="BillingsList-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <div style={{ display: 'flex' }}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="Billing tabs" contained>
            <Tab className={styles.tab}>{"Today's bills"}</Tab>
            <Tab className={styles.tab}>{t('patientBills', 'Patient Bill')}</Tab>
          </TabList>
        </div>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <BillsTable />
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <PatientBillsScreen />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default BillingTabs;
