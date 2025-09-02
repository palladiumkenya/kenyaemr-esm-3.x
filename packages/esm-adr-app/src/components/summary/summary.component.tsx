import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import styles from './summary.scss';
import AdrEncounter from '../encounters/adr-encounter.component';
import { useTranslation } from 'react-i18next';
import { useAdrAssessmentEncounter } from '../encounters/encounter.resource';
import {
  Button,
  Checkbox,
  DataTableSkeleton,
  Layer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TextInput,
} from '@carbon/react';
import { CloudMonitoring, Activity, IbmWatsonDiscovery, Settings, Search } from '@carbon/react/icons';
import PatientSearch from '../patient-search/patient-search.component';

type SummaryProps = {};

const Summary: React.FC<SummaryProps> = () => {
  const { t } = useTranslation();
  const defaultDateRange: [Date, Date] = [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()];
  const [dateRange, setDateRange] = useState<[Date, Date]>(defaultDateRange);
  const formattedStartDate = dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const formattedEndDate = dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const { encounters, isLoading } = useAdrAssessmentEncounter(formattedStartDate, formattedEndDate);
  const [counts, setCounts] = useState({
    assessment: 0,
  });

  const handleDateRangeChange = ([start, end]: Array<Date>) => {
    if (start && end) {
      setDateRange([start, end]);
    }
  };

  useEffect(() => {
    const adrAssessmentCount = encounters.filter(
      (encounter) => encounter.encounterTypeUuid === 'd18d6d8a-4be2-4115-ac7e-86cc0ec2b263',
    ).length;

    setCounts({
      assessment: adrAssessmentCount,
    });
  }, [encounters]);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton showHeader={false} showToolbar={false} zebra />
      </div>
    );
  }

  return (
    <div className={styles.summaryContainer}>
      <Tabs>
        <TabList contained>
          <Tab renderIcon={Search}>{t('search', 'Search')}</Tab>
          <Tab renderIcon={CloudMonitoring}>{t('adrEncounters', 'ADR Encounters')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PatientSearch />
          </TabPanel>
          <TabPanel>
            <AdrEncounter encounters={encounters} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default Summary;
