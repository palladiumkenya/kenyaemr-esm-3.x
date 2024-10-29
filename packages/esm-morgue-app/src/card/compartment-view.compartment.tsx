import React from 'react';
import styles from './compartment.scss';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';
import { Visit } from '@openmrs/esm-framework';

interface CompartmentViewProps {
  patients: Visit[];
}

const CompartmentView: React.FC<CompartmentViewProps> = ({ patients }) => {
  return (
    <div className={styles.allPatientCardWrapper}>
      {patients.map((patient, index) => (
        <div key={index} className={styles.cardRow}>
          {patient ? <AvailableCompartment patientInfo={patient} index={index} /> : <EmptyCompartment />}
        </div>
      ))}
    </div>
  );
};

export default CompartmentView;
