import React, { useRef, useState } from 'react';
import styles from './shr-summary.scss';
import { Tab, Tabs, TabList, TabPanel, TabPanels, StructuredListSkeleton, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType, useSession } from '@openmrs/esm-framework';
import { useSHRSummary } from '../hooks/useSHRSummary';
import { Printer } from '@carbon/react/icons';
import { useReactToPrint } from 'react-to-print';
import PrintComponent from '../print-layout/print.component';
import SHRVitalsDataTable from './shrVitalsDataTable.component';
import SHRLabResultsDataTable from './shrLabResultsDataTable.component';
import SHRComplaintsDataTable from './shrComplaintsDataTable.component';
import SHRDiagnosisDataTable from './shrDiagnosisDataTable.component';
import SHRAllergiesDataTable from './shrAllergiesDataTable.component';
import SHRConditionsDataTable from './shrConditionsDataTable.component';
import SHRMedicationsDataTable from './shrMedicationsDataTable.component';

interface SHRSummaryProps {
  patientUuid: string;
}

const SharedHealthRecordsSummary: React.FC<SHRSummaryProps> = ({ patientUuid }) => {
  const { data, isError, isLoading } = useSHRSummary(patientUuid);
  const currentUserSession = useSession();
  const componentRef = useRef(null);
  const [printMode, setPrintMode] = useState(false);
  const layout = useLayoutType();
  const { t } = useTranslation();
  const isTablet = useLayoutType() == 'tablet';

  const printRef = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => setPrintMode(true),
    onAfterPrint: () => setPrintMode(false),
    pageStyle: styles.pageStyle,
    documentTitle: 'Shared Health Records',
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const handlePrint = async () => {
    await delay(500);
    printRef();
  };

  // If still loading
  if (isLoading) {
    return <StructuredListSkeleton role="progressbar" />;
  }

  // If there is an error
  if (isError) {
    return <span>{t('errorSHRSummary', 'Error loading SHR summary')}</span>;
  }

  // If there is no data
  if (Object.keys(data)?.length === 0) {
    return;
  }

  const tableHeaders = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'value',
      header: t('value', 'Value'),
    },
    {
      key: 'dateRecorded',
      header: t('daterecorded', 'Date Recorded'),
    },
  ];

  const headers = ['Name', 'Value', 'Date Recorded'];
  // const [selectedTab, setSelectedTab] = useState(0);

  if (Object.keys(data).length > 0) {
    return (
      <div className={styles.bodyContainer} ref={componentRef}>
        {printMode === true && <PrintComponent />}

        <div className={styles.card}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4 className={styles.title}> {t('shrPatientSHRSummary', 'Patient SHR Summary')}</h4>
            {printMode === false && (
              <Button
                size="sm"
                className={styles.btnShow}
                onClick={() => {
                  handlePrint(), setPrintMode(true);
                }}
                kind="tertiary"
                renderIcon={(props) => <Printer size={16} {...props} />}
                iconDescription={t('print', 'Print')}>
                {t('print', 'Print')}
              </Button>
            )}
          </div>

          <hr />

          <div className={styles.summaryContainer}>
            <Tabs className={`${styles.verticalTabs} ${layout === 'tablet' ? styles.tabletTabs : styles.desktopTabs}`}>
              <TabList aria-label="Shared Medical Record tabs" className={styles.tablist}>
                <Tab
                  className={`${styles.tab} ${styles.bodyLong01}`}
                  id="vitals-tab"
                  disabled={data?.vitals.length <= 0}>
                  {t('vitals', 'Vitals')}
                </Tab>
                <Tab className={styles.tab} id="labresults-tab" disabled={data?.labResults.length <= 0}>
                  {t('labresults', 'labResults')}
                </Tab>
                <Tab className={styles.tab} id="complaints-tab" disabled={data?.complaints.length <= 0}>
                  {t('complaints', 'Complaints')}
                </Tab>
                <Tab className={styles.tab} id="diagnosis-tab" disabled={data?.diagnosis.length <= 0}>
                  {t('diagnosis', 'Diagnosis')}
                </Tab>
                <Tab className={styles.tab} id="allergies-tab" disabled={data?.allergies.length <= 0}>
                  {t('allergies', 'Allergies')}
                </Tab>
                <Tab className={styles.tab} id="conditions-tab" disabled={data?.conditions.length <= 0}>
                  {t('conditions', 'Conditions')}
                </Tab>
                <Tab className={styles.tab} id="medications-tab" disabled={data?.medications.length <= 0}>
                  {t('medications', 'Medications')}
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div>
                    <SHRVitalsDataTable data={data?.vitals} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRLabResultsDataTable data={data?.labResults} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRComplaintsDataTable data={data?.complaints} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDiagnosisDataTable data={data?.diagnosis} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRAllergiesDataTable data={data?.allergies} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRConditionsDataTable data={data?.conditions} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRMedicationsDataTable data={data?.medications} />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <h4 className={styles.title}> {t('noSharedHealthRecordsFound', 'No Shared Health Records Found')}</h4>
      </div>
    );
  }
};

export default SharedHealthRecordsSummary;
