import { Layer, Tabs, TabList, Tab, TabPanels, TabPanel, Checkbox, Button, TextInput } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ContactList from './contact-list.component';
import PeerCalendar from '../peer-calendar/peer-calendar.component';

type ContactDashboardProps = {
  patientUuid: string;
};

const ContactDashboard: React.FC<ContactDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tabs>
        <TabList contained>
          <Tab>{t('contactList', 'Contact List')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ContactList patientUuid={patientUuid} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layer>
  );
};

export default ContactDashboard;
