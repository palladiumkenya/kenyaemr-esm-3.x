import { Button, Checkbox, Layer, Tab, TabList, TabPanel, TabPanels, Tabs, TextInput } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AntenatalCare from './antenatal-care.component';
import PostnatalCare from './postnatal-care.component';
import LabourDelivery from './labour-delivery.component';
import { ExtensionSlot } from '@openmrs/esm-framework';
type MaternalAndChildDashboardProps = {
  patientUuid: string;
};

const MaternalAndChildDashboard: React.FC<MaternalAndChildDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tabs>
        <TabList contained>
          <Tab>{t('antenatalCare', 'Antenatal Care')}</Tab>
          <Tab>{t('postnatalCare', 'Postnatal Care')}</Tab>
          <Tab>{t('labourAndDelivery', 'Labour & Delivery')}</Tab>
          <Tab>{t('partograph', 'Partograph')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AntenatalCare patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <PostnatalCare patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <LabourDelivery patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <ExtensionSlot name="maternal-and-child-health-partograph-slot" state={{ patientUuid }} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layer>
  );
};

export default MaternalAndChildDashboard;
