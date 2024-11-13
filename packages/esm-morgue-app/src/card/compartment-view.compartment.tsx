import React from 'react';
import styles from './compartment.scss';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';
import { Visit } from '@openmrs/esm-framework';
import EmptyDeceasedSearch from '../empty-state/empty-search-deceased.component';
import { useTranslation } from 'react-i18next';

interface CompartmentViewProps {
  patientVisit: Array<Visit>;
  searchQuery: string;
}

const CompartmentView: React.FC<CompartmentViewProps> = ({ patientVisit, searchQuery }) => {
  const { t } = useTranslation();
  const filteredPatients = patientVisit.filter((patient) =>
    patient.patient.display.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return filteredPatients.length > 0 ? (
    <div className={styles.allPatientCardWrapper}>
      {filteredPatients.map((patient, index) => (
        <div key={index} className={styles.cardRow}>
          {patient ? <AvailableCompartment patientVisitInfo={patient} index={index} /> : <EmptyCompartment />}
        </div>
      ))}
    </div>
  ) : (
    <div className={styles.emptyStateContainer}>
      <EmptyDeceasedSearch
        title={t('noResultNotFound', 'No result found')}
        subTitle={t('adjustFilterOrSwitch', 'Try adjusting your search.')}
      />
    </div>
  );
};

export default CompartmentView;
