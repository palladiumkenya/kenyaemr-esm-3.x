import React, { useState } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Layer,
  Button,
  Checkbox,
  TextInput,
  Search,
  SkeletonText,
} from '@carbon/react';
import { CloudMonitoring, Activity, Settings, Search as MPISearchIcon } from '@carbon/react/icons';
import styles from './mpi-search.scss';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@openmrs/esm-framework';
import { useMPISearch } from './mpi-search.resource';

const MPISearch: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { patients, error, isLoading } = useMPISearch(debouncedSearchTerm);

  return (
    <div className={styles.mpiSearchContainer}>
      <Tabs>
        <TabList aria-label="List of tabs" contained>
          <Tab renderIcon={MPISearchIcon}>{t('mpiSearch', 'MPI Search')}</Tab>
          <Tab renderIcon={CloudMonitoring}>Monitoring</Tab>
          <Tab renderIcon={Activity}>Activity</Tab>
          <Tab renderIcon={MPISearchIcon}>Analyze</Tab>
          <Tab disabled renderIcon={Settings}>
            Settings
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Search
              size="lg"
              placeholder={t('searchPlaceholder', 'Search using patient name or ID')}
              labelText={t('searchLabel', 'Search')}
              closeButtonLabelText={t('clearSearch', 'Clear search input')}
              id="search-1"
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={() => {}}
            />
            {isLoading ? (
              <>
                <SkeletonText />
                <SkeletonText />
              </>
            ) : (
              <>{JSON.stringify(patients, null, 2)}</>
            )}
          </TabPanel>
          <TabPanel>
            <Layer>
              <form
                style={{
                  margin: '2em',
                }}>
                <legend className={`cds--label`}>Validation example</legend>
                <Checkbox id="cb" labelText="Accept privacy policy" />
                <Button
                  style={{
                    marginTop: '1rem',
                    marginBottom: '1rem',
                  }}
                  type="submit">
                  Submit
                </Button>
                <TextInput type="text" labelText="Text input label" helperText="Optional help text" />
              </form>
            </Layer>
          </TabPanel>
          <TabPanel>Tab Panel 3</TabPanel>
          <TabPanel>Tab Panel 4</TabPanel>
          <TabPanel>Tab Panel 5</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default MPISearch;
