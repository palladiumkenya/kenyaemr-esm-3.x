import { Button, Row, Tag, Tile } from '@carbon/react';
import { launchWorkspace, type Patient, PatientPhoto, useLayoutType, showSnackbar } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './patient-search-info.scss';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';

type PatientSearchInfoProps = {
  patient: Patient;
  onClick?: () => void;
  disabled?: boolean;
};

const PatientSearchInfo: React.FC<PatientSearchInfoProps> = ({ patient, onClick, disabled }) => {
  const responsiveSize = useLayoutType() === 'tablet' ? 'lg' : 'md';
  const { t } = useTranslation();
  const { admissionLocation } = useAdmissionLocation();
  const isAdmitted = admissionLocation?.bedLayouts
    .map((bed) => bed.patients)
    .flat()
    .some((p) => p.uuid === patient.uuid);

  const handleClick = () => {
    if (isAdmitted) {
      showSnackbar({
        title: t('deceasedAlreadyAdmitted', 'Deceased patient Already Admitted'),
        subtitle: t('patientAlreadyAdmittedMessage', 'This deceased patient has already been admitted.'),
        kind: 'error',
        isLowContrast: true,
      });
    } else {
      launchWorkspace('patient-additional-info-form', {
        workspaceTitle: t('admissionForm', 'Admission form'),
        patientUuid: patient.uuid,
      });
    }
  };

  return (
    <div
      className={`${styles.patientInfoContainer} ${!disabled && !isAdmitted ? styles.pointer : styles.notAllowed}`}
      onClick={!disabled ? handleClick : undefined}>
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
          <div className={styles.causeDisplay}>{patient?.person?.causeOfDeath?.display}</div>
        </div>
      </Tile>
      {isAdmitted && (
        <div className={styles.admissionRequestActionBar}>
          <Row className={styles.buttonRow}>
            <p>{t('deceasedHasAlreadyBeenAdmitted', 'Deceased has already been admitted')}</p>
          </Row>
        </div>
      )}
    </div>
  );
};

export default PatientSearchInfo;
