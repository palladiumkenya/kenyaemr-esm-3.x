import React, { useState } from 'react';
import { ContentSwitcher, Switch } from '@carbon/react';
import styles from '../../hiv-testing-component.scss';
import { useTranslation } from 'react-i18next';
import HivScreeningEncounters from './tabs/hiv-screening.component';
import HivTestingEncounters from './tabs/hiv-testing.component';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface OverviewListProps {
  patientUuid: string;
}

const HivTestingEncountersList: React.FC<OverviewListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={t('htsClinicalView', 'HTS Clinical View')}>
        <div className={styles.contextSwitcherContainer}>
          <ContentSwitcher
            size="md"
            selectedIndex={selectedIndex}
            onChange={({ index }) => setSelectedIndex(index ?? 0)}>
            <Switch name={'screening'} text="Screening" />
            <Switch name={'hivTesting'} text="Testing" />
          </ContentSwitcher>
        </div>
      </CardHeader>
      {<>{selectedIndex == 0 && <HivScreeningEncounters patientUuid={patientUuid} />}</>}
      {<>{selectedIndex == 1 && <HivTestingEncounters patientUuid={patientUuid} />}</>}
    </div>
  );
};

export default HivTestingEncountersList;
