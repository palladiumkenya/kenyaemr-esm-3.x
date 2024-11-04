import React from 'react';
import styles from './compartment.scss';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';
import { Visit } from '@openmrs/esm-framework';

interface CompartmentViewProps {
  patientVisit: Array<Visit>;
}

const CompartmentView: React.FC<CompartmentViewProps> = ({ patientVisit }) => {
  return (
    <div className={styles.allPatientCardWrapper}>
      {patientVisit.map((patient, index) => (
        <div key={index} className={styles.cardRow}>
          {patient ? <AvailableCompartment patientVisitInfo={patient} index={index} /> : <EmptyCompartment />}
        </div>
      ))}
    </div>
  );
};

export default CompartmentView;
