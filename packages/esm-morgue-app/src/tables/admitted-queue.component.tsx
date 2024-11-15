import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import CompartmentView from '../card/compartment-view.compartment';
import usePatientPerson, { useActiveMorgueVisit } from '../hook/useMorgue.resource';
import { InlineLoading } from '@carbon/react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';

export const AdmittedQueue: React.FC = () => {
  const { data: activeDeceased, error, isLoading } = useActiveMorgueVisit();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t('pullingCompartment', 'Pulling compartments data.....')}
      />
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('allocation', 'Allocation')} />;
  }

  return (
    <div className={styles.layoutWrapper}>
      <CardHeader title={t('allocation', 'Allocation')} children={''} />
      <DeceasedFilter onSearchChange={handleSearchChange} />
      <div className={styles.patientCardContainer}>
        <CompartmentView patientVisit={activeDeceased} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default AdmittedQueue;
