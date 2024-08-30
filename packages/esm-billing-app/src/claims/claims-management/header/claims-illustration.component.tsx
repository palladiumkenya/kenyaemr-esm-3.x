import React from 'react';
import styles from './claims-header.scss';
import { LicenseGlobal } from '@carbon/react/icons';

const ClaimsIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <LicenseGlobal className={styles.iconOverrides} />
    </div>
  );
};

export default ClaimsIllustration;
