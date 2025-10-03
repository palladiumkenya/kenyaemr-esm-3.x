import React from 'react';
import Triage from '../triage/triage.component';
import { ExtensionSlot, HomePictogram, PageHeader, PageHeaderContent } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import styles from './mch.scss';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import MCHTriage from './mch.triage.component';
import MCHConsultation from './mch.consultation.component';
import toUpper from 'lodash/toUpper';
import { useTranslation } from 'react-i18next';

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
          title={`${toUpper(dashboardTitle)} ${selectedIndex === 0 ? 'Triage' : 'Consultation'}`}
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
