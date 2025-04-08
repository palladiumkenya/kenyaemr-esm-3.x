import { DataTableSkeleton, Layer, Tile, Tabs, TabList, Tab, TabPanel, TabPanels } from '@carbon/react';
import {
  CardHeader,
  EmptyDataIllustration,
  ErrorState,
  getPatientUuidFromStore,
} from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usePatientIdentifiers from '../hooks/usePatientIdentifiers';
import styles from './tables/shr-tables.scss';
import { useConfig } from '@openmrs/esm-framework';
import { ReferralConfigObject } from '../config-schema';
import PatientSHRSummaryTable from './tables/shr-summary-table.component';
import DependentsComponent from '../referrals/dependents/dependents.component';

const SHRSummaryPanel = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const { socialHealthAuthorityIdentifierType } = useConfig<ReferralConfigObject>();
  const { error, isLoading, hasType } = usePatientIdentifiers(patientUuid);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('shrSummary', 'SHR Summary')} />;
  }

  // if (!hasType(socialHealthAuthorityIdentifierType)) {
  //   return (
  //     <div>
  //       <Layer>
  //         <Tile className={styles.tile}>
  //           <CardHeader title={t('shrRecords', 'SHR Records')}>{''}</CardHeader>
  //           <EmptyDataIllustration />
  //           <p className={styles.content}>
  //             {t(
  //               'shrError',
  //               'Patient must have CR Number.Please register the patient with the client registry to retrieve their SHR Records',
  //             )}
  //           </p>
  //         </Tile>
  //       </Layer>
  //     </div>
  //   );
  // }

  return (
    <div>
      <Tabs>
        <TabList aria-label="List of tabs" contained>
          <Tab>{t('dependents', 'Dependents')}</Tab>
          <Tab>{t('pullSHRRecords', 'Pull SHR Records')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <DependentsComponent patientUuid={patientUuid} patient={patient} />
          </TabPanel>
          <TabPanel>
            <PatientSHRSummaryTable />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default SHRSummaryPanel;
