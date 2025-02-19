import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import CompartmentView from '../card/compartment-view.compartment';
import { useDeceasedPatient } from '../hook/useMorgue.resource';
import { InlineLoading } from '@carbon/react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import EmptyMorgueAdmission from '../empty-state/empty-morgue-admission.component';

export const AdmittedQueue: React.FC = () => {
  // const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();
  const { t } = useTranslation();
  // const [searchQuery, setSearchQuery] = useState('');

  // const handleSearchChange = (query: string) => {
  //   setSearchQuery(query);
  // };

  // const admittedPatients = deceasedPatients?.filter((patient) => patient.status === 'admitted') || [];
  // if (isLoading) {
  //   return (
  //     <InlineLoading
  //       status="active"
  //       iconDescription="Loading"
  //       description={t('pullingCompartment', 'Pulling compartments data.....')}
  //     />
  //   );
  // }

  // if (error) {
  //   return <ErrorState error={error} headerTitle={t('allocation', 'Allocation')} />;
  // }

  // if (admittedPatients?.length === 0) {
  //   return (
  //     <EmptyMorgueAdmission
  //       title={t('allocations', 'Allocation')}
  //       subTitle={t('noAdmittedBodies', 'There are no admitted bodies')}
  //     />
  //   );
  // }

  return (
    <div className={styles.layoutWrapper}>
      <CardHeader title={t('allocation', 'Allocation')} children={''} />
      {/* <DeceasedFilter onSearchChange={handleSearchChange} /> */}
      <div className={styles.patientCardContainer}>
        <CompartmentView />
      </div>
    </div>
  );
};

export default AdmittedQueue;
