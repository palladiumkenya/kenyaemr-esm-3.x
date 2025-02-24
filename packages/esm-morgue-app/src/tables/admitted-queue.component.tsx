import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import CompartmentView from '../card/compartment-view.compartment';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import { InlineLoading } from '@carbon/react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import EmptyMorgueAdmission from '../empty-state/empty-morgue-admission.component';
import useEmrConfiguration from '../hook/useAdmitPatient';
import { useDischargedPatient } from '../hook/useDischargedPatient';

export const AdmittedQueue: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { admissionLocation, isLoading, error } = useAdmissionLocation();
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingData', 'Error loading data')} error={error} />;
  }

  const filteredBedLayouts = admissionLocation?.bedLayouts?.filter((bed) => {
    return bed.patients.some((patient) => patient?.person?.display?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className={styles.layoutWrapper}>
      <CardHeader title={t('allocation', 'Allocation')} children={''} />
      <DeceasedFilter onSearchChange={handleSearchChange} />
      <div className={styles.patientCardContainer}>
        {filteredBedLayouts?.length === 0 ? (
          <EmptyMorgueAdmission
            title={t('allocations', 'Allocation')}
            subTitle={t('noAdmittedBodies', 'There are no admitted bodies matching your search')}
          />
        ) : (
          <CompartmentView />
        )}
      </div>
    </div>
  );
};

export default AdmittedQueue;
