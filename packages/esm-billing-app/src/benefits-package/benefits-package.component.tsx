import React, { useState } from 'react';
import BenefitsTable from './table/benefits-table.component';
import styles from './benefits-package.scss';
import { useTranslation } from 'react-i18next';
import { CardHeader, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useLayoutType } from '@openmrs/esm-framework';
import Benefits from './benefits/benefits.component';
import { Layer, Tile, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Task, Upload } from '@carbon/react/icons';

const BenefitsPackage = () => {
  const { t } = useTranslation();
  return (
    <Layer className={styles.container}>
      <Tile>
        <CardHeader title={t('shaBenefits', 'SHA benefits')} children={''} />
      </Tile>
      <div className={styles.tabs}>
        <Tabs>
          <TabList contained activation="manual" aria-label="List of panels">
            <Tab renderIcon={Task}>{t('eligibleBenefits', 'Eligible benefits')}</Tab>
            <Tab renderIcon={Upload}>{t('preauthRequest', 'Preauth requests')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Benefits />
            </TabPanel>
            <TabPanel>
              <BenefitsTable />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Layer>
  );
};

export default BenefitsPackage;
