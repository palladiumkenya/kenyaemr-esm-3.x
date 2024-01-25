import React, { useState } from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel, ContentSwitcher, Switch, SwitcherItem } from '@carbon/react';
import styles from '../../maternal-health-component.scss';
import { useTranslation } from 'react-i18next';
import AntenatalCareList from './tabs/antenatal-care.component';
import LabourDeliveryList from './tabs/labour-delivery.component';
import PostnatalCareList from './tabs/postnatal-care.component';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface OverviewListProps {
  patientUuid: string;
}

type SwitcherItem = {
  index: number;
  name?: string;
  text?: string;
};
const MaternalHealthList: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [switchItem, setSwitcherItem] = useState<SwitcherItem>({ index: 0 });

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={t('mchClinicalView', 'MCH Clinical Viewsss')}>
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher selectedIndex={switchItem?.index} onChange={setSwitcherItem}>
            <Switch name={'antenatal'} text="Antenatal Care" />
            <Switch name={'labourAndDelivery'} text="Labour and Delivery" />
            <Switch name={'postnatal'} text="Postnatal Care" />
          </ContentSwitcher>
        </div>
      </CardHeader>
      {switchItem.index == 0 && <AntenatalCareList patientUuid={patientUuid} />}
      {switchItem.index == 1 && <LabourDeliveryList patientUuid={patientUuid} />}
      {switchItem.index == 2 && <PostnatalCareList patientUuid={patientUuid} />}
    </div>
  );
};

export default MaternalHealthList;
