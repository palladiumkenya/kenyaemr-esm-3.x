import React, { useRef, useState, useCallback } from 'react';
import styles from './shr-summary.scss';
import { Tab, Tabs, TabList, TabPanel, TabPanels, StructuredListSkeleton, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType, useSession } from '@openmrs/esm-framework';
import { useSHRSummary } from '../hooks/useSHRSummary';
import { Printer } from '@carbon/react/icons';
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

  // Custom print handler to avoid React 18 compatibility issues
  const handlePrint = useCallback(async () => {
    try {
      setPrintMode(true);

      // Wait for the component to render in print mode
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (componentRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printContent = componentRef.current.innerHTML;
          printWindow.document.documentElement.innerHTML = `
            <head>
              <title>Shared Health Records</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .bodyContainer { max-width: 1200px; margin: 0 auto; }
                .card { border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; }
                .title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .tablist { display: none; }
                .tabpanel { display: block !important; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          `;
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      // Fallback to browser print
      window.print();
    } finally {
      setPrintMode(false);
    }
  }, []);

  // If still loading
  if (isLoading) {
    return <StructuredListSkeleton />;
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className={styles.title}> {t('shrPatientSHRSummary', 'Patient SHR Summary')}</h4>
              <Button
                kind="ghost"
                renderIcon={Printer}
                onClick={handlePrint}
                iconDescription={t('print', 'Print')}
                size="sm">
                {t('print', 'Print')}
              </Button>
            </div>
          </div>

          <hr />

          <div className={styles.summaryContainer}>
            <Tabs>
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
