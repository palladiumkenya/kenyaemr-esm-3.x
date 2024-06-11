import React from 'react';
import { TabPanels, TabList, Tabs, Tab, TabPanel } from '@carbon/react';
import { TestsOrdered } from './test-ordered/tests-ordered.component';
import { useTranslation } from 'react-i18next';
import WorkList from './work-list/work-list.component';
import { ReferredTests } from './referred-test/referred-ordered.component';
import { Review } from './review-ordered/review-ordered.component';
import { ApprovedOrders } from './approved/approved-orders.component';
import { OrdersNotDone } from './orders-not-done/orders-not-done.component';

export const RadiologyTabs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Tabs>
        <TabList aria-label="List of tabs" contained style={{ marginLeft: '1rem' }}>
          <Tab>{t('pendingOrders', 'Active Orders')}</Tab>
          <Tab>{t('workList', 'WorkList')}</Tab>
          <Tab>{t('referredProcedures', 'Referred Out')}</Tab>
          <Tab>{t('review', 'Pending Review')}</Tab>
          <Tab>{t('approved', 'Approved')}</Tab>
          <Tab>{t('notDone', 'Not Done')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TestsOrdered />
          </TabPanel>
          <TabPanel>
            <WorkList fulfillerStatus={'IN_PROGRESS'} />
          </TabPanel>
          <TabPanel>
            <ReferredTests />
          </TabPanel>
          <TabPanel>
            <Review />
          </TabPanel>
          <TabPanel>
            <ApprovedOrders />
          </TabPanel>
          <TabPanel>
            <OrdersNotDone fulfillerStatus={'DECLINED'} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};
