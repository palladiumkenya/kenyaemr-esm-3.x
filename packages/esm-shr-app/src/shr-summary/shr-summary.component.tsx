import { DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { CardHeader, EmptyDataIllustration, ErrorState, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usePatientIdentifiers from '../hooks/usePatientIdentifiers';
import PatientSHRSummaryTable from './tables/shr-summary-table.component';
import styles from './tables/shr-tables.scss';
import { useConfig } from '@openmrs/esm-framework';
import { ReferralConfigObject } from '../config-schema';
const SHRSummaryPanel = () => {
  const patientUuid = getPatientUuidFromUrl();
  const { t } = useTranslation();
  const { nationalPatientUniqueIdentifier } = useConfig<ReferralConfigObject>();
  const { error, isLoading, hasType, identifiers } = usePatientIdentifiers(patientUuid);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('shrSummary', 'SHR Summary')} />;
  }

  if (!hasType(nationalPatientUniqueIdentifier)) {
    return (
      <div>
        <Layer>
          <Tile className={styles.tile}>
            <CardHeader title={t('shrRecords', 'SHR Records')}>{''}</CardHeader>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t(
                'shrError',
                'Patient must have CR Number.Please register the patient with the client registry to retrieve their SHR Records',
              )}
            </p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={`omrs-main-content`}>
      <PatientSHRSummaryTable />
    </div>
  );
};

export default SHRSummaryPanel;
