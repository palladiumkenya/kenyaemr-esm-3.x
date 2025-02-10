import { Button, Row, Tag, Tile } from '@carbon/react';
import { launchWorkspace, type Patient, PatientPhoto, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './patient-search-info.scss';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';

type PatientSearchInfoProps = {
  patient: Patient;
};

const PatientSearchInfo: React.FC<PatientSearchInfoProps> = ({ patient }) => {
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { t } = useTranslation();
  const patientUuid = patient.uuid;

  const handleAdmissionForm = (patientUuid: string) => {
    launchWorkspace('patient-additional-info-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientUuid,
    });
  };

  return (
    <div className={styles.patientInfoContainer}>
      <Tile className={styles.patientInfo}>
        <div className={styles.patientAvatar} role="img">
          <PatientPhoto patientUuid={patient.uuid} patientName={patient?.person?.display} />
        </div>
        <div className={styles.patientDetails}>
          <h2 className={styles.patientName}>{patient?.person?.display}</h2>
          <div className={styles.demographics}>
            {patient?.person?.gender} <span className={styles.middot}>&middot;</span> {patient?.person?.age}
            <span className={styles.middot}>&middot;</span>
            <Tag>
              {patient?.identifiers?.find((id) => id?.display?.startsWith('OpenMRS ID = '))?.display?.split(' = ')[1]}
            </Tag>
            {patient?.person?.dead && (
              <Tag size="md" type="high-contrast" className={styles.deceased}>
                {t('deceased', 'Deceased')}
              </Tag>
            )}
          </div>
          <div className={styles.causeDisplay}>{patient?.person?.causeOfDeath?.display}</div>{' '}
        </div>
      </Tile>
      <div className={styles.admissionRequestActionBar}>
        <Row className={styles.buttonRow}>
          <Button
            kind="primary"
            size={responsiveSize}
            className={styles.actionButton}
            onClick={() => handleAdmissionForm(patientUuid)}>
            {t('admitBody', 'Admit body')}
          </Button>
          <Button kind="danger" size={responsiveSize} className={styles.actionButton}>
            {t('disposeBody', 'Dispose body')}
          </Button>
        </Row>
      </div>
    </div>
  );
};

export default PatientSearchInfo;
