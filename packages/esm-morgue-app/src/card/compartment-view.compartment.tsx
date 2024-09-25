import React from 'react';
import styles from './unit-patient-card.scss';
import { DeceasedInfo } from '../tables/generic-table.resource';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';

interface CompartmentViewProps {
  patient?: DeceasedInfo | null;
}

const CompartmentView: React.FC<CompartmentViewProps> = ({ patient }) => {
  return (
    <div className={styles.allPatientCardWrapper}>
      <div className={styles.cardRow}>
        {patient ? <AvailableCompartment patientInfo={patient} /> : <EmptyCompartment />}
      </div>
    </div>
  );
};

export default CompartmentView;
