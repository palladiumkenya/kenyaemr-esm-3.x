import React from 'react';
import styles from './compartment.scss';
import { Button } from '@carbon/react';
import { Movement } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

const EmptyCompartment: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.cardView}>
      <div className={`${styles.cardRow} ${styles.centeredContent}`}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>1</div>
        </div>
        <span className={styles.noCompartment}>{t('empty', 'Empty')}</span>
      </div>
      <Button className={styles.assignButton} kind="primary" renderIcon={Movement}>
        Assign
      </Button>
    </div>
  );
};

export default EmptyCompartment;
