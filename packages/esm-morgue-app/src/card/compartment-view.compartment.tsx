import React from 'react';
import styles from './compartment.scss';
import { DeceasedInfo } from '../tables/generic-table.resource';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';

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
