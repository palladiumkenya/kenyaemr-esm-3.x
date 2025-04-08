import { Button, DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyDataIllustration,
  ErrorState,
  getPatientUuidFromStore,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePatient from '../../hooks/usePatient';
import SharedHealthRecordsSummary from '../../shrpatient-summary/shrpatient-summary.component';
import styles from './shr-tables.scss';

interface PatientSHRSummaryTableProps {}

const PatientSHRSummaryTable: React.FC<PatientSHRSummaryTableProps> = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const layout = useLayoutType();
  const headerTitle = t('shrRecords', 'SHR Records');

  const patientUuid = getPatientUuidFromStore();
  const [accessGranted, setAccessGranted] = useState(false);
  const { error, isLoading, patientPhoneNumber, patientName } = usePatient(patientUuid);

  if (isLoading) {
    return <DataTableSkeleton />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('shrRecords', 'SHR Records')} />;
  }

  const handleInitiateAuthorization = () => {
    launchPatientWorkspace('shr-authorization-form', {
      workspaceTitle: 'SHR Pull Authorization Form',
      patientUuid,
      onVerified: () => {
        setAccessGranted(true);
      },
      patientPhoneNumber,
      patientName,
    });
  };

  if (!accessGranted) {
    return (
      <div>
        <Layer>
          <Tile className={styles.tile}>
            <CardHeader title={t('shrRecords', 'SHR Records')}>
              <Button
                kind="ghost"
                renderIcon={ArrowRight}
                onClick={handleInitiateAuthorization}
                className={styles.btnOutline}>
                {t('pullSHRRecords', 'Pull SHR Records')}
              </Button>
            </CardHeader>
            <EmptyDataIllustration />
            <p className={styles.content}>{t('noSHRRecords', 'SHR Records have not been pulled')}</p>
            <Button onClick={handleInitiateAuthorization} renderIcon={ArrowRight} kind="ghost">
              {t('pullSHRRecords', 'Pull SHR Records')}
            </Button>
          </Tile>
        </Layer>
      </div>
    );
  }

  return <SharedHealthRecordsSummary patientUuid={patientUuid} />;
};

export default PatientSHRSummaryTable;
