import React from 'react';
import { TabPanels, TabPanel, TabList, Tabs, Tab } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './relationships-tabs.scss';
import ContactList from '../../contact-list/contact-list.component';
import FamilyHistory from '../../family-partner-history/family-history.component';

interface RelationshipsTabProps {
  patientUuid: string;
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  return (
    <main>
      <Tabs className={styles.tabs}>
        <TabList className={styles.tablist} aria-label="List tabs" contained>
          <Tab className={styles.tab}>{t('family', 'Family')}</Tab>
          <Tab className={styles.tab}>{t('pnsContacts', 'PNS Contacts')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FamilyHistory patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <ContactList patientUuid={patientUuid} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
};
