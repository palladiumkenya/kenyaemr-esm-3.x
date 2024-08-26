import React from 'react';
import styles from './providers-header.scss';
import { MedicalStaff } from '@carbon/pictograms-react';

const ProvidersIllustration: React.FC = () => {
  return (
    <div className={styles.svg__container}>
      <MedicalStaff className={styles.icon__overiders} />
    </div>
  );
};

export default ProvidersIllustration;
