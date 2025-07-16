import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs, InlineLoading } from '@carbon/react';
import { ExtensionSlot, useConfig, useLayoutType } from '@openmrs/esm-framework';

import styles from './mortuary-summary.scss';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import { usePerson } from '../deceased-patient-header/deceasedInfo/deceased-info.resource';
import BillingHistoryView from './panels/billing-history.component';
import AutopsyView from './panels/autopsy.component';
import AttachmentView from './panels/attachement.component';
import { useActiveMorgueVisit } from './view-details.resource';

const MortuarySummary: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromStore();
  const { isLoading } = usePerson(patientUuid);
  const { isLoading: isActiveLoading } = useActiveMorgueVisit(patientUuid);

  if (isLoading || isActiveLoading) {
    return (
      <InlineLoading status="active" iconDescription="Loading" description={t('loadData', 'Loading summary data...')} />
    );
  }

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.morgueLabel}>{''}</p>
      <ExtensionSlot name="deceased-banner-info-slot" state={{ patientUuid }} />
      <Tabs>
        <TabList aria-label="morgue summary tabs" className={styles.tablist}>
          <Tab className={styles.tab} id="billing-tab">
            {t('billingHistory', 'Billing history')}
          </Tab>
          <Tab className={classNames(styles.tab, styles.bodyLong01)} id="autopsy-tab">
            {t('autopsyReport', 'Autopsy report')}
          </Tab>

          <Tab className={styles.tab} id="medications-tab">
            {t('attachements', 'Attachements')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BillingHistoryView />
          </TabPanel>
          <TabPanel>
            <AutopsyView />
          </TabPanel>
          <TabPanel>
            <AttachmentView />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default MortuarySummary;
