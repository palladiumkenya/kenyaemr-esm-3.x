import React from 'react';
import styles from './illustration.scss';
import { PedestrianFamily } from '@carbon/react/icons';

const IllustrationSvg: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <PedestrianFamily />
    </div>
  );
};

export default IllustrationSvg;
