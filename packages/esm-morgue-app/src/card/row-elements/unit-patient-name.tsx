import React from 'react';
import styles from '../unit-patient-card.scss'; // Updated the path

const UnitPatientName: React.FC<{ patient: any }> = ({ patient }) => {
  return <div className={styles.unitPatientName}>{patient?.person?.preferredName?.display}</div>;
};

export default UnitPatientName;
