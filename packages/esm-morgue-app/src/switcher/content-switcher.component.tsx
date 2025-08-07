import React from 'react';
import {
  DataTableSkeleton,
  ContentSwitcher,
  Switch,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Search,
  ComboBox,
  SkeletonText,
  RadioButtonSkeleton,
  TextInputSkeleton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './content-switcher.scss';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import AwaitingBedLayout from '../bed-layout/awaiting/awaiting-bed-layout.component';
import BedLayout from '../bed-layout/admitted/admitted-bed-layout.component';
import { MortuaryLocationResponse, MortuaryPatient } from '../types';
import AwaitingBedLineListView from '../bed-linelist-view/awaiting/awaiting-bed-linelist-view.component';
import AdmittedBedLineListView from '../bed-linelist-view/admitted/admitted-bed-linelist-view.component';
import DischargedBedLayout from '../bed-layout/discharged/discharged-bed-layout.component';
import DischargedBedLineListView from '../bed-linelist-view/discharged/discharged-bed-line-view.component';

enum ViewType {
  LIST = 0,
  CARD = 1,
}

enum TabType {
  AWAITING_ADMISSION = 0,
  ADMITTED = 1,
  DISCHARGE = 2,
}

interface TabConfig {
  id: string;
  labelKey: string;
  defaultLabel: string;
}

interface CustomContentSwitcherProps {
  awaitingQueueDeceasedPatients: Array<MortuaryPatient>;
  isLoading: boolean;
  locationItems: Array<{
    id: string;
    text: string;
    [key: string]: any;
  }>;
  selectedLocation: string;
  admissionLocation: MortuaryLocationResponse | null;
  isLoadingLocation: boolean;
  isLoadingAdmission: boolean;
  locationError: Error;
  admissionError: Error;
  onLocationChange: (data: { selectedItem: { id: string; text: string } }) => void;
  mutate: () => void;
  dischargedPatients?: any[];
  isLoadingDischarge?: boolean;
}

const CustomContentSwitcher: React.FC<CustomContentSwitcherProps> = ({
  awaitingQueueDeceasedPatients,
  isLoading,
  locationItems,
  selectedLocation,
  admissionLocation,
  isLoadingLocation,
  isLoadingAdmission,
  locationError,
  admissionError,
  onLocationChange,
  mutate,
  dischargedPatients = [],
  isLoadingDischarge = false,
}) => {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = React.useState<ViewType>(ViewType.LIST);
  const [selectedTab, setSelectedTab] = React.useState<TabType>(TabType.AWAITING_ADMISSION);

  const tabs: TabConfig[] = [
    { id: 'awaiting-admission', labelKey: 'awaitingAdmission', defaultLabel: 'Awaiting Admission' },
    { id: 'admitted', labelKey: 'admitted', defaultLabel: 'Admitted' },
    { id: 'discharge', labelKey: 'discharge', defaultLabel: 'Discharge' },
  ];

  const handleViewChange = React.useCallback(({ index }: { index: number }) => {
    setSelectedView(index as ViewType);
  }, []);

  const handleTabChange = React.useCallback((state: { selectedIndex: number }) => {
    setSelectedTab(state.selectedIndex as TabType);
  }, []);

  const renderTabContent = React.useCallback(
    (tabIndex: TabType) => {
      const isListView = selectedView === ViewType.LIST;

      if (isLoading || isLoadingAdmission || (tabIndex === TabType.DISCHARGE && isLoadingDischarge)) {
        return (
          <div className={styles.loadingContainer}>
            <DataTableSkeleton showHeader={false} showToolbar={false} />
          </div>
        );
      }

      switch (tabIndex) {
        case TabType.AWAITING_ADMISSION:
          return isListView ? (
            <div className={styles.listContainer}>
              <AwaitingBedLineListView
                awaitingQueueDeceasedPatients={awaitingQueueDeceasedPatients}
                mortuaryLocation={admissionLocation}
                isLoading={isLoading}
                mutated={mutate}
              />
            </div>
          ) : (
            <>
              <AwaitingBedLayout
                mortuaryLocation={admissionLocation}
                awaitingQueueDeceasedPatients={awaitingQueueDeceasedPatients}
                isLoading={isLoading}
                mutated={mutate}
              />
            </>
          );

        case TabType.ADMITTED:
          return isListView ? (
            <div className={styles.listContainer}>
              <AdmittedBedLineListView
                AdmittedDeceasedPatient={admissionLocation}
                isLoading={isLoadingAdmission}
                mutate={mutate}
              />
            </div>
          ) : (
            <>
              <BedLayout AdmittedDeceasedPatient={admissionLocation} isLoading={isLoadingAdmission} mutate={mutate} />
            </>
          );

        case TabType.DISCHARGE:
          return isListView ? (
            <div className={styles.listContainer}>
              <DischargedBedLineListView
                AdmittedDeceasedPatient={admissionLocation}
                isLoading={isLoadingDischarge}
                mutate={mutate}
              />
            </div>
          ) : (
            <>
              <DischargedBedLayout
                AdmittedDeceasedPatient={admissionLocation}
                isLoading={isLoadingDischarge}
                mutate={mutate}
              />
            </>
          );

        default:
          return null;
      }
    },
    [
      selectedView,
      isLoading,
      isLoadingAdmission,
      isLoadingDischarge,
      awaitingQueueDeceasedPatients,
      admissionLocation,
      dischargedPatients,
      mutate,
    ],
  );

  return (
    <div className={styles.switcherContainer}>
      <CardHeader title={isLoading ? t('loading', 'Loading...') : t('mortuaryOperations', 'Mortuary operations')}>
        {locationItems.length > 1 &&
          (isLoadingLocation ? (
            <RadioButtonSkeleton />
          ) : (
            <ComboBox
              items={locationItems}
              id="mortuaryLocations"
              placeholder={t('chooseOptions', 'Choose options')}
              itemToString={(item) => item?.text || ''}
              onChange={onLocationChange}
              selectedItem={locationItems.find((item) => item.id === selectedLocation) || null}
            />
          ))}

        <ContentSwitcher size="sm" className={styles.switcher} selectedIndex={selectedView} onChange={handleViewChange}>
          <Switch>{isLoading ? <RadioButtonSkeleton /> : t('listView', 'List')}</Switch>
          <Switch>{isLoading ? <RadioButtonSkeleton /> : t('cardView', 'Card')}</Switch>
        </ContentSwitcher>
      </CardHeader>

      <div className={styles.tabsContainer}>
        <Tabs selectedIndex={selectedTab} onChange={handleTabChange}>
          {isLoading || isLoadingAdmission || isLoadingDischarge ? (
            <div className={styles.tabSkeletonContainer}>
              <div className={styles.tabListSkeleton}>
                {[1, 2, 3].map((i) => (
                  <RadioButtonSkeleton key={i} className={styles.tabSkeleton} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.tabListContainer}>
              <TabList scrollDebounceWait={200}>
                {tabs.map((tab) => (
                  <Tab key={tab.id}>
                    {t(tab.labelKey, tab.defaultLabel)}
                    {tab.id === 'awaiting-admission' && ` (${awaitingQueueDeceasedPatients?.length || 0})`}
                    {tab.id === 'admitted' &&
                      ` (${
                        admissionLocation?.bedLayouts?.reduce((total, bed) => total + (bed.patients?.length || 0), 0) ||
                        0
                      })`}
                    {tab.id === 'discharge' && ` (${dischargedPatients?.length || 0})`}
                  </Tab>
                ))}
              </TabList>
            </div>
          )}

          <TabPanels>
            {tabs.map((_, index) => (
              <TabPanel key={index}>{renderTabContent(index as TabType)}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomContentSwitcher;
