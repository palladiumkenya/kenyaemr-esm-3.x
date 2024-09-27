import React from 'react';
import styles from './compartment.scss';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';
import { DeceasedInfo } from '../types';

interface CompartmentViewProps {
  patients: (DeceasedInfo | null)[];
}

const CompartmentView: React.FC<CompartmentViewProps> = ({ patients }) => {
  return (
    <div className={styles.allPatientCardWrapper}>
      {patients.map((patient, index) => (
        <div key={index} className={styles.cardRow}>
          {patient ? <AvailableCompartment patientInfo={patient} /> : <EmptyCompartment />}
        </div>
      ))}
    </div>
  );
};

export default CompartmentView;
