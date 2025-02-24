import { Button, Layer, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { SearchAdvanced } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useEmrConfiguration from '../hook/useAdmitPatient';
import { useDischargedPatient } from '../hook/useDischargedPatient';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import { AdmittedQueue } from '../tables/admitted-queue.component';
import { DischargedBodies } from '../tables/discharge-queue.component';
import styles from './tabs.scss';

export const MorgueTabs: React.FC = () => {
  const { t } = useTranslation();
  const { admissionLocation } = useAdmissionLocation();
  const admittedCount = admissionLocation?.bedLayouts?.filter((bed) => bed.status === 'OCCUPIED').length || 0;
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();

  const dischargeEncounterTypeUuid = emrConfiguration?.exitFromInpatientEncounterType?.uuid;
  const { dischargedPatientUuids, isLoading: isLoadingDischargedPatient } =
    useDischargedPatient(dischargeEncounterTypeUuid);
  const dischargedCount = dischargedPatientUuids?.length || 0;

  const getTabLabel = (baseLabel: string, count: number | null) => (
    <span className={styles.tabLabel}>
      {baseLabel} {count ? `(${count})` : ''}
    </span>
  );

  const tabPanels = [
    {
      name: getTabLabel(t('admitted', 'Admitted'), admittedCount),
      component: <AdmittedQueue />,
    },
    {
      name: getTabLabel(t('discharged', 'Discharged'), dischargedCount),
      component: (
        <DischargedBodies
          isLoading={isLoadingDischargedPatient || isLoadingEmrConfiguration}
          error={errorFetchingEmrConfiguration}
          dischargedPatientUuids={dischargedPatientUuids}
        />
      ),
    },
  ];
  const handleAdmitBodyWorkspace = () => {
    launchWorkspace('admit-body-form');
  };
  return (
    <div className={styles.referralsList} data-testid="">
      <Tabs selected={0} role="navigation">
        <div className={styles.tabsContainer}>
          <TabList aria-label="Content Switcher as Tabs" contained>
            {tabPanels.map((tab, index) => (
              <Tab key={index}>{tab.name}</Tab>
            ))}
          </TabList>
          <div className={styles.actionBtn}>
            <Button
              kind="primary"
              renderIcon={(props) => <SearchAdvanced size={40} {...props} />}
              onClick={() => handleAdmitBodyWorkspace()}
              className={styles.actionBtn}
              disabled={isLoadingDischargedPatient}>
              {t('admitBodies', 'Admit bodies')}
            </Button>
          </div>
        </div>

        <TabPanels>
          {tabPanels.map((tab, index) => (
            <TabPanel key={index}>
              <Layer>{tab.component}</Layer>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};
