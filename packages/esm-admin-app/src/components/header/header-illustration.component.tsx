import React from 'react';
import styles from './header.scss';
import { IbmCloudant } from '@carbon/react/icons';

const ETLIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <IbmCloudant className={styles.iconOveriders} />
    </div>
  );
};

export default ETLIllustration;
