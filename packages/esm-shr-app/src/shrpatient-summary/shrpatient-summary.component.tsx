import React, { useRef, useState } from 'react';
import styles from './shr-summary.scss';
import { Tab, Tabs, TabList, TabPanel, TabPanels, StructuredListSkeleton, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType, useSession } from '@openmrs/esm-framework';
import { useSHRSummary } from '../hooks/useSHRSummary';
import { Printer } from '@carbon/react/icons';
import { useReactToPrint } from 'react-to-print';
import PrintComponent from '../print-layout/print.component';
import SHRDataTable from './shrDataTable.component';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';

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
    return <ErrorState error={isError} headerTitle={t('shrRecordSummary', 'SHR Records Summary')} />;
  }

  // If there is no data
  if (Object.keys(data)?.length === 0) {
    return;
  }

  const vitalsHeaders = [
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
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  const labResultsHeaders = [
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
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  const complaintsHeaders = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'value',
      header: t('value', 'Value'),
    },
    {
      key: 'onsetDate',
      header: t('onsetDate', 'Onset Date'),
    },
    {
      key: 'dateRecorded',
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  const diagnosisHeaders = [
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
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  const allergiesHeaders = [
    {
      key: 'allergen',
      header: t('allergen', 'Allergen'),
    },
    {
      key: 'reaction',
      header: t('reaction', 'Reaction'),
    },
    {
      key: 'severity',
      header: t('severity', 'Severity'),
    },
    {
      key: 'onsetDate',
      header: t('onsetDate', 'Onset Date'),
    },
    {
      key: 'dateRecorded',
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  const conditionsHeaders = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'onsetDate',
      header: t('onsetDate', 'Onset Date'),
    },
    {
      key: 'status',
      header: t('status', 'Status'),
    },
    {
      key: 'dateRecorded',
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  const referralsHeaders = [
    {
      key: 'requesterCode',
      header: t('requesterCode', 'Requester Code'),
    },
    {
      key: 'Category',
      header: t('Category', 'Category'),
    },
    {
      key: 'priority',
      header: t('priority', 'Priority'),
    },
    {
      key: 'dateRequested',
      header: t('dateRequested', 'Date Requested'),
    },
  ];

  const medicationsHeaders = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'onsetDate',
      header: t('onsetDate', 'Onset Date'),
    },
    {
      key: 'value',
      header: t('value', 'Value'),
    },
    {
      key: 'status',
      header: t('status', 'Status'),
    },
    {
      key: 'dateRecorded',
      header: t('dateRecorded', 'Date Recorded'),
    },
  ];

  if (Object.keys(data).length > 0) {
    return (
      <div className={styles.bodyContainer} ref={componentRef}>
        {printMode === true && <PrintComponent />}

        <div className={styles.card}>
          <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
            <h4 className={styles.title}> {t('shrPatientSHRSummary', 'Patient SHR Summary')}</h4>
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
                <Tab className={styles.tab} id="referrals-tab" disabled={data?.referrals.length <= 0}>
                  {t('referrals', 'Referrals')}
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.vitals} tableHeaders={vitalsHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.labResults} tableHeaders={labResultsHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.complaints} tableHeaders={complaintsHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.diagnosis} tableHeaders={diagnosisHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.allergies} tableHeaders={allergiesHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.conditions} tableHeaders={conditionsHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.medications} tableHeaders={medicationsHeaders} />
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <SHRDataTable data={data?.referrals} tableHeaders={referralsHeaders} />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </div>
    );
  } else {
    return <EmptyState displayText={t('shrRecords', 'SHR Records')} headerTitle={t('shrRecords', 'SHR Records')} />;
  }
};

export default SharedHealthRecordsSummary;
