import { Button, ButtonSkeleton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { IbmCloudLogging } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BillsTable from '../bills-table/bills-table.component';
import PatientBillsScreen from '../past-patient-bills/patient-bills-dashboard/patient-bills-dashboard';
import { useClockInStatus } from '../payment-points/use-clock-in-status';
import styles from './billing-tabs.scss';

const BillingTabs = () => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  const { isClockedIn, isLoading } = useClockInStatus();

  const openClockInModal = () => {
    const dispose = showModal('clock-in-modal', {
      closeModal: () => dispose(),
    });
  };

  return (
    <div data-testid="BillingsList-list">
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange}>
        <div style={{ display: 'flex' }}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="Billing tabs" contained>
            <Tab>{"Today's bills"}</Tab>
            <Tab>{t('patientBills', 'Patient Bill')}</Tab>
          </TabList>
          {isLoading ? (
            <ButtonSkeleton className={styles.clockInSkeleton} />
          ) : (
            !isClockedIn && (
              <Button
                onClick={openClockInModal}
                className={styles.clockIn}
                renderIcon={IbmCloudLogging}
                iconDescription="Clock In">
                Clock In
              </Button>
            )
          )}
        </div>
        <TabPanels>
          <TabPanel>
            <BillsTable />
          </TabPanel>
          <TabPanel>
            <PatientBillsScreen />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default BillingTabs;
