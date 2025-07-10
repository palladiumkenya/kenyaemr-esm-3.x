import React from 'react';
import { DataTableSkeleton, ContentSwitcher, Switch, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './content-switcher.scss';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import BedLayout from '../bed-layout/bed-layout.component';

// Enum for better type safety and readability
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

const CustomContentSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = React.useState<ViewType>(ViewType.LIST);
  const [selectedTab, setSelectedTab] = React.useState<TabType>(TabType.AWAITING_ADMISSION);

  // Configuration for tabs to make it more maintainable
  const tabs: TabConfig[] = [
    { id: 'awaiting-admission', labelKey: 'awaitingAdmission', defaultLabel: 'Awaiting Admission' },
    { id: 'admitted', labelKey: 'admitted', defaultLabel: 'Admitted' },
    { id: 'discharge', labelKey: 'discharge', defaultLabel: 'Discharge' },
  ];

  // Handler for view switcher
  const handleViewChange = React.useCallback(({ index }: { index: number }) => {
    setSelectedView(index as ViewType);
  }, []);

  // Handler for tab change
  const handleTabChange = React.useCallback((state: { selectedIndex: number }) => {
    setSelectedTab(state.selectedIndex as TabType);
  }, []);

  // Render content based on selected view and tab
  const renderTabContent = React.useCallback(
    (tabIndex: TabType) => {
      const isListView = selectedView === ViewType.LIST;

      switch (tabIndex) {
        case TabType.AWAITING_ADMISSION:
          return isListView ? (
            <div className={styles.listContainer}>
              <h2>{t('awaitingAdmissionList', 'Awaiting Admission - List View')}</h2>
              {/* Add your list component here */}
            </div>
          ) : (
            <BedLayout />
          );

        case TabType.ADMITTED:
          return isListView ? (
            <div className={styles.listContainer}>
              <h2>{t('admittedList', 'Admitted - List View')}</h2>
              {/* Add your admitted patients list component here */}
            </div>
          ) : (
            <div className={styles.cardContainer}>
              <h2>{t('admittedCard', 'Admitted - Card View')}</h2>
              {/* Add your admitted patients card component here */}
            </div>
          );

        case TabType.DISCHARGE:
          return isListView ? (
            <div className={styles.listContainer}>
              <h2>{t('dischargeList', 'Discharge - List View')}</h2>
              {/* Add your discharge list component here */}
            </div>
          ) : (
            <div className={styles.cardContainer}>
              <h2>{t('dischargeCard', 'Discharge - Card View')}</h2>
              {/* Add your discharge card component here */}
            </div>
          );

        default:
          return null;
      }
    },
    [selectedView, t],
  );

  return (
    <div className={styles.switcherContainer}>
      <CardHeader title={t('mortuaryOperations', 'Mortuary operations')}>
        <ContentSwitcher size="sm" className={styles.switcher} selectedIndex={selectedView} onChange={handleViewChange}>
          <Switch>{t('listView', 'List')}</Switch>
          <Switch>{t('cardView', 'Card')}</Switch>
        </ContentSwitcher>
      </CardHeader>

      <div className={styles.tabsContainer}>
        <Tabs selectedIndex={selectedTab} onChange={handleTabChange}>
          <div className={styles.tabListContainer}>
            <TabList scrollDebounceWait={200}>
              {tabs.map((tab) => (
                <Tab key={tab.id}>{t(tab.labelKey, tab.defaultLabel)}</Tab>
              ))}
            </TabList>
          </div>

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
