import { Button, Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './shr-tables.scss';
import { useParams } from 'react-router-dom';
import useCurrentPatient from '../../hooks/useCurrentPatient';
import { ExpansionPannel } from '../expansion-pannel';

interface PatientSHRSummartTableProps {}

const PatientSHRSummartTable: React.FC<PatientSHRSummartTableProps> = () => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const layout = useLayoutType();
  const headerTitle = t('shrRecords', 'SHR Records');
  const patientUuid = useCurrentPatient();
  const [accessGranted, setAccessGranted] = useState(false);

  const handleInitiateAuthorization = () => {
    launchWorkspace('shr-authorization-form', {
      workspaceTitle: 'SHR Pull Authorization Form',
      patientUuid,
      onVerified: () => {
        setAccessGranted(true);
      },
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

  return <ExpansionPannel />;
  // return <EmptyState displayText={t('shrRecords', 'SHR Records')} headerTitle={t('shrRecords', 'SHR Records')} />;
};

export default PatientSHRSummartTable;
