import React from 'react';
import { ImageMedical } from '@carbon/react/icons';
import styles from './radiology-header.scss';

const RadiologyIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <ImageMedical className={styles.iconOverrides} />
    </div>
  );
};

export default RadiologyIllustration;
