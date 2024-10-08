import React from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import CompartmentView from '../card/compartment-view.compartment';
import { InlineLoading } from '@carbon/react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useDeceasedPatient } from './generic-table.resource';

export const AdmittedQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient('test');
  const { t } = useTranslation();

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
      <DeceasedFilter />
      <div className={styles.patientCardContainer}>
        <CompartmentView patients={deceasedPatients || []} />
      </div>
    </div>
  );
};
