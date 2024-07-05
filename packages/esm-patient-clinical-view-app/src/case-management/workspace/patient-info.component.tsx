import { Tile, InlineLoading } from '@carbon/react';
import { PatientPhoto, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import styles from './patient-info.scss';
import { formatPatientName } from '../../utils/expression-helper';

const PatientInfo: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { isLoading, patient, error } = usePatient(patientUuid);
  const formattedName = formatPatientName(patient);

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading patient data ..." />;
  }

  if (error) {
    return <span>Error loading patient information</span>;
  }

  const identifiers =
    patient?.identifier?.map((id) => ({
      text: id.type?.text,
      value: id.value,
    })) || [];

  return (
    <Tile className={styles.patientInfo}>
      <div className={styles.patientAvatar} role="img">
        <PatientPhoto patientUuid={patient.id} patientName={formattedName} />
      </div>
      <div className={styles.patientDetails}>
        <h2 className={styles.patientName}>{formattedName}</h2>
        <div className={styles.demographics}>
          {patient?.gender} <span className={styles.middot}>&middot;</span> {patient?.birthDate}
        </div>
        <div className={styles.identifiers}>
          {identifiers.map((identifier, index) => (
            <div key={index}>
              <span>{identifier.text}: </span>
              <span>{identifier.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Tile>
  );
};

export default PatientInfo;
