import React from 'react';
import { Dashboard, CloudMonitoring } from '@carbon/react/icons';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Layer } from '@carbon/react';
import styles from './payment-dashboard.scss';
import { useTranslation } from 'react-i18next';
import { PaymentFilterProvider } from './usePaymentFilterContext';
import { FilterDashboard } from './filters/filter-dashboard';
import { PaymentHistoryViewer } from './payment-history-viewer.component';
import PaymentMethodDistribution from './payment-method-distribution.component';

export const PaymentDashboard = () => {
  const { t } = useTranslation();

  return (
    <PaymentFilterProvider>
      <FilterDashboard />
      <Layer className={styles.paymentDashboard}>
        <Tabs>
          <TabList aria-label={t('listOfTabs', 'List of tabs on transactions')} contained>
            <Tab renderIcon={Dashboard}>{t('transactionHistory', 'Transaction History')}</Tab>
            <Tab renderIcon={CloudMonitoring}>{t('paymentModeSummary', 'Payment Mode Summary')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <PaymentHistoryViewer />
            </TabPanel>
            <TabPanel>
              <PaymentMethodDistribution />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layer>
    </PaymentFilterProvider>
  );
};
