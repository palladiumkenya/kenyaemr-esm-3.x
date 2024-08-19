import { DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { CardHeader, EmptyDataIllustration, ErrorState, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usePatientIdentifiers from '../hooks/usePatientIdentifiers';
import PatientSHRSummartTable from './tables/shr-summary-table.component';
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
              {t('shrError', 'Cant pull patient SHR Records, Patient NUPI (CR) Number Needed')}
            </p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={`omrs-main-content`}>
      <PatientSHRSummartTable />
    </div>
  );
};

export default SHRSummaryPanel;
