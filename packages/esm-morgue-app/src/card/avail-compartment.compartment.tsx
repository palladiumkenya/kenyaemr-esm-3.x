import React from 'react';
import styles from './unit-patient-card.scss';
import { Button, Tag } from '@carbon/react';
import { View } from '@carbon/react/icons';
import { DeceasedInfo } from '../tables/generic-table.resource';
import { toUpperCase } from '../helpers/expression-helper';
import { formatDate } from '@openmrs/esm-framework';

interface AvailableCompartmentProps {
  patientInfo: DeceasedInfo;
}

const AvailableCompartment: React.FC<AvailableCompartmentProps> = ({ patientInfo }) => {
  return (
    <div className={styles.cardView}>
      <div className={styles.cardRow}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>3</div>
        </div>
        <span className={styles.deceasedName}>{toUpperCase(patientInfo.person.display)}</span>
      </div>
      <div className={styles.cardRow}>
        <span className={styles.deceasedDate}>Death date: {formatDate(new Date(patientInfo.person.deathDate))}</span>
        <span className={styles.deceasedAge}>Age: 28</span>
        <span className={styles.deceasedResidences}>
          Area: {patientInfo.person.preferredAddress?.address4 || 'N/A'}
        </span>
      </div>

      {/* <div className={styles.cardRow}>
        <span className={styles.causeofDeath}>
          <Tag type="red">{patientInfo?.person?.causeOfDeath?.display}</Tag>
        </span>
      </div> */}
      <div className={styles.cardRow}>
        <span className={styles.compartmentStatus}>
          Status:
          <Tag type="green">Logged</Tag>
        </span>
        <span className={styles.deceasedNoDays}>Days on this unit:</span>
        <span className={styles.noDays}>4 days</span> {/* Update to dynamically calculate */}
      </div>
      <Button className={styles.assignButton} kind="primary" renderIcon={View}>
        View details
      </Button>
    </div>
  );
};

export default AvailableCompartment;
