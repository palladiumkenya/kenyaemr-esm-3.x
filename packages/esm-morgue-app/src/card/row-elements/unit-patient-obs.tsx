import { SkeletonText, Tag } from '@carbon/react';
import { type OpenmrsResource, translateFrom } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../unit-patient-card.scss';

const UnitPatientObs = ({ patient, visit }) => {
  const { t } = useTranslation();

  return (
    <div>
      <span className={styles.UnitPatientObsLabel}>t('labelColon', 'MALARIA')</span>
    </div>
  );
};

export default UnitPatientObs;
