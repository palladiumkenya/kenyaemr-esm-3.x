import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { Task } from '@carbon/react/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ChargeSummaryTable from './charge-summary-table.component';
import styles from './clinical-charges.scss';
import BillingHeader from '../../billing-header/billing-header.component';

const ClinicalCharges = () => {
  const { t } = useTranslation();

  return (
    <div>
      <BillingHeader title={t('clinicalCharges', 'Clinical Charges')} />
      <div className={styles.clinicalChargesContainer}>
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
            <TabPanel className={styles.tabPanel}>
              <ChargeSummaryTable />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicalCharges;
