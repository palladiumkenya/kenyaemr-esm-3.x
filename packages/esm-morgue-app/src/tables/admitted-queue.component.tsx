import React from 'react';
import { useTranslation } from 'react-i18next';
import DeceasedFilter from '../header/admitted-queue-header.component';
import styles from './admitted-queue.scss';
import CompartmentView from '../card/compartment-view.compartment';
import { useActiveMorgueVisit, useDeceasedPatient } from '../hook/useMorgue.resource';
import { InlineLoading } from '@carbon/react';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';

export const AdmittedQueue: React.FC = () => {
  const { data: activeDeceased, error, isLoading } = useActiveMorgueVisit();
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
        <CompartmentView patientVisit={activeDeceased} />
      </div>
    </div>
  );
};
