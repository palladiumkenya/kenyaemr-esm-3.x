import React from 'react';
import BillingHeader from '../billing-header/billing-header.component';
import { useTranslation } from 'react-i18next';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button } from '@carbon/react';
import styles from './payment-points-styles.scss';
import { PaymentPointsTable } from './payment-points-table.component';
import { showModal } from '@openmrs/esm-framework';

export const PaymentPoints = () => {
  const { t } = useTranslation();

  const openPaymentPointModal = () => {
    const dispose = showModal('create-payment-point', {
      closeModal: () => dispose(),
    });
  };

  return (
    <div>
      <BillingHeader title={t('paymentPoints', 'Payment Points')} />
      <div className={styles.tabs}>
        <Tabs>
          <div className={styles.tablistHeader}>
            <TabList contained>
              <Tab>{t('paymentPoints', 'Payment Points')}</Tab>
              <Tab>{t('cashiers', 'Cashiers')}</Tab>
            </TabList>
            <Button onClick={() => openPaymentPointModal()}>Create Payment Point</Button>
          </div>
          <TabPanels>
            <TabPanel className={styles.tabPanel}>
              <PaymentPointsTable />
            </TabPanel>
            <TabPanel className={styles.tabPanel}>two</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};
