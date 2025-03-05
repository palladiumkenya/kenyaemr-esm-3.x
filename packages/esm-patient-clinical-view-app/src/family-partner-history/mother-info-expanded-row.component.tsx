import React, { useEffect } from 'react';
import styles from './family-history.scss';
import { Tile, InlineLoading } from '@carbon/react';
import useLatestMotherMedicalDetails from '../hooks/useLatestMotherMedicalDetails';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, showSnackbar } from '@openmrs/esm-framework';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib/src';
type MotherInfoExpandedRowProps = {
  patientUuid: string;
};

const MotherInfoExpandedRow: React.FC<MotherInfoExpandedRowProps> = ({ patientUuid }) => {
  const { data, error, isLoading } = useLatestMotherMedicalDetails(patientUuid);
  const { t } = useTranslation();
  const title = t('mothersInfo', 'Mother Program info');
  useEffect(() => {
    if (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorLoadingMothersObs', 'Error loading mothers obs'),
        subtitle: error?.message,
      });
    }
  }, [error, t]);

  if (isLoading) {
    return (
      <InlineLoading
        description={t('loadingMothersInfo', "Loading mother's medical info")}
        iconDescription={t('loading', 'Loading')}
      />
    );
  }

  if (error) {
    return null;
  }

  if (!data?.length) {
    return <EmptyState displayText={t('programInfo', 'Program Info')} headerTitle={title} />;
  }

  return (
    <div className={styles.motherInfoExpandedRow}>
      <CardHeader title={title} children={<></>} />
      <Tile className={styles.obsValues}>
        {data.map((obs) => (
          <div key={obs.uuid}>
            <p>
              <strong>{obs.display}</strong>: <span>{`${obs.value} ${obs.unit}`}</span>
            </p>
            <p>
              <strong>{t('dateRecorded', 'Date recorded')}</strong>: <span>{formatDate(parseDate(obs.obsDate))}</span>
            </p>
          </div>
        ))}
      </Tile>
    </div>
  );
};

export default MotherInfoExpandedRow;
