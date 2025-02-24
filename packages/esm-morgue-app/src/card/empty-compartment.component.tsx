import React from 'react';
import styles from './empty-compartment.scss';
import { Button, Tile } from '@carbon/react';
import { Movement } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { launchWorkspace } from '@openmrs/esm-framework';
interface EmptyCompartmentProps {
  bedNumber: string;
}

const EmptyCompartment: React.FC<EmptyCompartmentProps> = ({ bedNumber }) => {
  const { t } = useTranslation();
  const handleSearchAdmitWorkspace = () => {
    launchWorkspace('admit-body-form');
  };
  return (
    <div className={styles.cardView}>
      <div className={`${styles.cardRow} ${styles.centeredContent}`}>
        <div className={styles.cardLabelWrapper}>
          <div className={styles.cardLabel}>{bedNumber}</div>
        </div>
        <span className={styles.noCompartment}>{t('empty', 'Empty')}</span>
      </div>
    </div>
  );
};

export default EmptyCompartment;
