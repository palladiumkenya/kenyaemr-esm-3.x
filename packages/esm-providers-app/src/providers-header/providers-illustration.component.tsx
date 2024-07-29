import React from 'react';
import styles from './providers-header.scss';
import { Events } from '@carbon/react/icons';

const ProvidersIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <Events className={styles.iconOverrides} />
    </div>
  );
};

export default ProvidersIllustration;
