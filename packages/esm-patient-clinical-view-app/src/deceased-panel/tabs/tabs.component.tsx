import React from 'react';
import styles from './tabs.scss';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import { Tile, Button, Tabs, TabList, Tab, TabPanels, TabPanel, Layer } from '@carbon/react';
import { Report, Folders, Wallet, WatsonHealthBrushFreehand, Movement, Return, Home } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import AttachmentView from '../panels/attachement.component';
import BillingHistoryView from '../panels/billing-history.component';
import AutopsyView from '../panels/autopsy.component';

const DeceasedDetailsView: React.FC = () => {
  const patientUuid = getPatientUuidFromUrl();
  const { patient } = usePatient(patientUuid);
  const { t } = useTranslation();
  const handleNavigateToAllocationPage = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/morgue/allocation`,
    });
  const handleNavigateToHomePage = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/morgue`,
    });
  return (
    <div className={styles.deceasedDetailsContainer}>
      <Layer className={styles.container}>
        <Tile>
          <div className={styles.headingContainer}>
            <div className={styles.desktopHeading}>
              <h4>{t('overview', 'Overview panel')}</h4>
            </div>
            <div className={styles.actionBtn}>
              <Button
                className={styles.rightButton}
                kind="primary"
                size="sm"
                renderIcon={Home}
                onClick={handleNavigateToHomePage}>
                {t('morgueView', 'Morgue View')}
              </Button>
              <Button
                className={styles.rightButton}
                kind="secondary"
                size="sm"
                renderIcon={Return}
                onClick={handleNavigateToAllocationPage}>
                {t('allocation', 'Allocation View')}
              </Button>

              <Button className={styles.rightButton} kind="danger" size="sm" renderIcon={Movement}>
                {t('releaseBody', 'Release Body')}
              </Button>
            </div>
          </div>
        </Tile>

        <div className={styles.tabs}>
          <Tabs>
            <TabList contained activation="manual" aria-label="List of panels">
              <Tab renderIcon={WatsonHealthBrushFreehand}>{t('autopsyRecord', 'Autopsy summary')}</Tab>
              <Tab renderIcon={Wallet}>{t('billingHistory', 'Billing history')}</Tab>
              <Tab renderIcon={Report}>{t('attachments', 'Attachments')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <AutopsyView />
              </TabPanel>
              <TabPanel>
                <BillingHistoryView />
              </TabPanel>
              <TabPanel>
                <AttachmentView />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </Layer>
    </div>
  );
};

export default DeceasedDetailsView;
