import React from 'react';
import styles from './header.scss';
import { ChartColumn } from '@carbon/react/icons';

const SurveylanceIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <ChartColumn className={styles.iconOveriders} />
    </div>
  );
};

export default SurveylanceIllustration;
