import React from 'react';
import styles from './illustration.scss';
import { PedestrianFamily } from '@carbon/react/icons';

const IllustrationSvg: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <PedestrianFamily className={styles.iconOveriders} />
    </div>
  );
};

export default IllustrationSvg;
