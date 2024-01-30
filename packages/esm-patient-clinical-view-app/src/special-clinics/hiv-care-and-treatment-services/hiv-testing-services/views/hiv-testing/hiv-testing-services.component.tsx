import React, { useState } from 'react';
import { Tabs, Tab, TabList, TabPanels, TabPanel, ContentSwitcher, Switch, SwitcherItem } from '@carbon/react';
import styles from '../../hiv-testing-component.scss';
import { useTranslation } from 'react-i18next';
import HivScreeningEncounters from './tabs/hiv-screening.component';
import HivTestingEncounters from './tabs/hiv-testing.component';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface OverviewListProps {
  patientUuid: string;
}

type SwitcherItem = {
  index: number;
  name?: string;
  text?: string;
};
const HivTestingEncountersList: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [switchItem, setSwitcherItem] = useState<SwitcherItem>({ index: 0 });

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={t('htsClinicalView', 'HTS Clinical View')}>
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher selectedIndex={switchItem?.index} onChange={setSwitcherItem}>
            <Switch name={'screening'} text="Screening" />
            <Switch name={'hivTesting'} text="Testing" />
          </ContentSwitcher>
        </div>
      </CardHeader>
      {<>{switchItem.index == 0 && <HivScreeningEncounters patientUuid={patientUuid} />}</>}
      {<>{switchItem.index == 1 && <HivTestingEncounters patientUuid={patientUuid} />}</>}
    </div>
  );
};

export default HivTestingEncountersList;
