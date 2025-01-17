import React from 'react';
import styles from './providers-header.scss';
import { MedicalStaff } from '@carbon/pictograms-react';

const ProvidersIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <MedicalStaff className={styles.iconOveriders} />
    </div>
  );
};

export default ProvidersIllustration;
