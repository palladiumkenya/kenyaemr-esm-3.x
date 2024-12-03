import React from 'react';
import styles from './compartment.scss';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';
import EmptyDeceasedSearch from '../empty-state/empty-search-deceased.component';
import { useTranslation } from 'react-i18next';
import { DeceasedInfo } from '../types';

interface CompartmentViewProps {
  patientVisit: { results: DeceasedInfo[] };
  searchQuery: string;
}

const CompartmentView: React.FC<CompartmentViewProps> = ({ patientVisit, searchQuery }) => {
  const { t } = useTranslation();

  const filteredPatients = patientVisit.results?.filter((patient) =>
    patient.person.display.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return filteredPatients.length > 0 ? (
    <div className={styles.allPatientCardWrapper}>
      {filteredPatients.map((patient, index) => (
        <div key={patient.uuid} className={styles.cardRow}>
          <AvailableCompartment patientInfo={patient} index={index} />
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
