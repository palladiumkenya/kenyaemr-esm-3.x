import React from 'react';
import styles from '../unit-patient-card.scss';

const unitPatientAddress = () => {
  const preferredAddress = 'Mathare A3';

  return <div className={styles.unitPatientAddress}>{preferredAddress}</div>;
};

export default unitPatientAddress;
