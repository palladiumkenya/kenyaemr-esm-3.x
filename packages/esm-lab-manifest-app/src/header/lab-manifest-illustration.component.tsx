import React from 'react';
import styles from './lab-manifest-header.scss';
import { ChemistryReference } from '@carbon/react/icons';

const LabManifestIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <ChemistryReference className={styles.iconOverrides} />
    </div>
  );
};

export default LabManifestIllustration;
