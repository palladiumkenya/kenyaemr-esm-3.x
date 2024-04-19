import React from 'react';
import styles from './morgue-header.scss';
import { HospitalBed } from '@carbon/react/icons';

const MorgueIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <HospitalBed className={styles.iconOverrides} />
    </div>
  );
};

export default MorgueIllustration;
