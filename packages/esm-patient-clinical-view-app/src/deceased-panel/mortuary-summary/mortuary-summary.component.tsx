import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs, InlineLoading } from '@carbon/react';
import { useConfig, useLayoutType, formatDate } from '@openmrs/esm-framework';

import styles from './mortuary-summary.scss';
import BillingHistoryView from '../panels/billing-history.component';
import AutopsyView from '../panels/autopsy.component';
import AttachmentView from '../panels/attachement.component';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import { convertDateToDays, formatDateTime } from '../../utils/expression-helper';
import usePerson from '../hook/usePerson';
import { useActiveMorgueVisit } from '../hook/useMorgueVisit';
import { active } from 'd3';

const MortuarySummary: React.FC = () => {
  const config = useConfig();
  const { t } = useTranslation();
  const layout = useLayoutType();
  const patientUuid = getPatientUuidFromUrl();
  const { person, isLoading } = usePerson(patientUuid);
  const { activeVisit, isLoading: isActiveLoading } = useActiveMorgueVisit(patientUuid);
  const startDate = activeVisit?.startDatetime;
  const compartment = activeVisit?.encounters[0]?.location?.display;

  if (isLoading || isActiveLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        Suggested
        change
        description={t('loadData', 'Loading summary data...')}
      />
    );
  }

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.morgueLabel}>{''}</p>
      <div className={styles.metricList}>
        <div className={styles.metrics}>
          <div className={styles.wrapMetrics}>
            <span className={styles.metricLabel}>{t('dateOfAdmission', 'Date of admission')}</span>
            <span className={styles.metricValue}>{formatDateTime(startDate)}</span>
          </div>
          <div className={styles.wrapMetrics}>
            <span className={styles.metricLabel}>{t('dateAndTimeofDeath', 'Date and time of death')}</span>{' '}
            <span className={styles.metricValue}>{formatDateTime(person?.deathDate)}</span>
          </div>
          <div className={styles.wrapMetrics}>
            <span className={styles.metricLabel}>{t('lengthofStay', 'Length of stay')}</span>
            <span className={styles.metricValue}>
              {convertDateToDays(startDate)} {t('days', 'Days')}
            </span>
          </div>
          <div className={styles.wrapMetrics}>
            <span className={styles.metricLabel}>{t('compartment', 'Compartment')}</span>
            <span className={styles.metricValue}>{compartment}</span>
          </div>
        </div>
      </div>
      <Tabs className={classNames(styles.verticalTabs, layout === 'tablet' ? styles.tabletTabs : styles.desktopTabs)}>
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
