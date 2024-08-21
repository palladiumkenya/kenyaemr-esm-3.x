import React from 'react';
import styles from './providers-header.scss';
import { Events } from '@carbon/react/icons';
import { MedicalStaff } from '@carbon/pictograms-react';

const ProvidersIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <MedicalStaff className={styles.iconOverrides} />
    </div>
  );
};

export default ProvidersIllustration;
