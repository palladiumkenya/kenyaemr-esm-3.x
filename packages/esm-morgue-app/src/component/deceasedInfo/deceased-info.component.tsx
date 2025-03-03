import { Tile, InlineLoading } from '@carbon/react';
import { ErrorState, PatientPhoto, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './deceased-info.scss';
import { formatDeceasedName } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import { usePerson } from '../../hook/useMorgue.resource';

const DeceasedInfo: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { isLoading, patient, error } = usePatient(patientUuid);
  const { isLoading: isdeceasedDataLoading, error: deceasedError, person } = usePerson(patientUuid);

  const formattedName = formatDeceasedName(patient);
  const { t } = useTranslation();

  if (isLoading || isdeceasedDataLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading deceased data ..." />;
  }

  if (error || deceasedError) {
    return <ErrorState error={error} headerTitle={t('errorMessage', 'Error')} />;
  }

  return (
    <Tile className={styles.patientInfo}>
      <div className={styles.patientAvatar} role="img">
        <PatientPhoto patientUuid={patient.id} patientName={formattedName} />
      </div>
      <div className={styles.patientDetails}>
        <h2 className={styles.patientName}>{formattedName}</h2>
        <div className={styles.demographics}>
          {patient?.gender}
          <span className={styles.middot}>&middot;</span> {person?.age} Yrs
        </div>
        <div className={styles.causeDisplay}>
          {t('causeOfDeath', 'Cause of death: ')}
          {person?.causeOfDeath?.display}
        </div>
      </div>
    </Tile>
  );
};

export default DeceasedInfo;
