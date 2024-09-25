import React from 'react';
import styles from './unit-patient-card.scss';
import { Button } from '@carbon/react';
import { Movement } from '@carbon/react/icons';

const EmptyCompartment: React.FC = () => {
  return (
    <div className={styles.cardView}>
      <div className={`${styles.cardRow} ${styles.centeredContent}`}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>1</div>
        </div>
        <span className={styles.noCompartment}>Empty</span>
      </div>
      <Button className={styles.assignButton} kind="primary" renderIcon={Movement}>
        Assign
      </Button>
    </div>
  );
};

export default EmptyCompartment;
