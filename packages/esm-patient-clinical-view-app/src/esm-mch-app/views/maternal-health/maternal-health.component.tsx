import React from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import styles from '../../maternal-health-component.scss';
import { useTranslation } from 'react-i18next';
import AntenatalCareList from './tabs/antenatal-care.component';
import LabourDeliveryList from './tabs/labour-delivery.component';
import PostnatalCareList from './tabs/postnatal-care.component';

interface OverviewListProps {
  patientUuid: string;
}

const MaternalHealthList: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.tabContainer}>
      <Tabs>
        <TabList contained>
          <Tab>{t('antenatalCare', 'Antenatal Care')}</Tab>
          <Tab>{t('labourAndDelivery', 'Labour and Delivery')}</Tab>
          <Tab>{t('postnatalCare', 'Postnatal Care')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <AntenatalCareList patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <LabourDeliveryList patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <PostnatalCareList patientUuid={patientUuid} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default MaternalHealthList;
