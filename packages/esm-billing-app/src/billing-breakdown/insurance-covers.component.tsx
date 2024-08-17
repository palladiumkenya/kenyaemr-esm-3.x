import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels, Tile } from '@carbon/react';
import PatientBillsScreen from '../past-patient-bills/patient-bills-dashboard/patient-bills-dashboard';
import BillsTable from '../bills-table/bills-table.component';
import styles from './insurance-covers.scss';
import BillingHeader from '../billing-header/billing-header.component';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { ArrowLeft } from '@carbon/react/icons';
const InsuranceCovers = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <main className={styles.container}>
      <div className={styles.referralsList} data-testid="BillingsList-list">
        <BillingHeader title={t('home', 'Home')} />
        <div>
          <Tile>
            <ArrowLeft size={16} />{' '}
            <ConfigurableLink className={styles.link} to={'billing'}>
              {t('backToHome', 'Back to Home')}
            </ConfigurableLink>
          </Tile>
        </div>
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
    </main>
  );
};

export default InsuranceCovers;
