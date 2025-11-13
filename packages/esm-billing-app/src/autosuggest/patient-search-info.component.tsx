import { Tag, Tile } from '@carbon/react';
import { Patient, PatientPhoto } from '@openmrs/esm-framework';
import React from 'react';
import styles from './patient-search-info.scss';
type PatientSearchInfoProps = {
  patient: Patient;
};

const PatientSearchInfo: React.FC<PatientSearchInfoProps> = ({ patient }) => {
  return (
    <Tile className={styles.patientInfo}>
      <div className={styles.patientAvatar} role="img">
        <PatientPhoto patientUuid={patient.uuid} patientName={patient.person.display} />
      </div>
      <div className={styles.patientDetails}>
        <h2 className={styles.patientName}>{patient.person.display}</h2>
        <div className={styles.demographics}>
          {patient?.person?.gender} <span className={styles.middot}>&middot;</span> {patient?.person?.age}
          <span className={styles.middot}>&middot;</span>
          <Tag>
            OpenmrsId:{patient.identifiers.find((id) => id.identifierType.display === 'OpenMRS ID')?.identifier}
          </Tag>
          {/* {patient.identifiers.map((identifier) => (
            <span>{identifier.display}</span>
          ))} */}
        </div>
      </div>
    </Tile>
  );
};

export default PatientSearchInfo;
