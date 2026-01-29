import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { ExtensionSlot, HomePictogram, PageHeader, PageHeaderContent } from '@openmrs/esm-framework';
import toUpper from 'lodash/toUpper';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MCHConsultation from './mch.consultation.component';
import styles from './mch.scss';
import MCHTriage from './mch.triage.component';

type MchProps = {
  dashboardTitle: string;
};

const MCH: React.FC<MchProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  return (
    <div>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent
          title={`${toUpper(dashboardTitle)} ${
            selectedIndex === 0 ? t('triage', 'Triage') : t('consultation', 'Consultation')
          }`}
          illustration={<HomePictogram />}
        />

        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <Tabs
        onChange={({ selectedIndex }) => {
          setSelectedIndex(selectedIndex);
        }}
        selectedIndex={selectedIndex}
        aria-label="Tab navigation">
        <TabList activation="manual">
          <Tab>{t('triage', 'Triage')}</Tab>
          <Tab>{t('consultation', 'Consultation')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MCHTriage />
          </TabPanel>
          <TabPanel>
            <MCHConsultation />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default MCH;
