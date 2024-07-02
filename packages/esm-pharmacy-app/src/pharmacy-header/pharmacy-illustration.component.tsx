import { Hospital } from '@carbon/react/icons';
import React from 'react';
import styles from './pharmacy-header.scss';

const PharmacyIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <Hospital className={styles.iconOverrides} />
    </div>
  );
};

export default PharmacyIllustration;
