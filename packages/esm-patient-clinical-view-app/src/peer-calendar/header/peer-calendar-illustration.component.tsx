import { Calendar } from '@carbon/react/icons';
import React from 'react';
import styles from './peer-calendar-header.scss';

const PeerCalendarIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <Calendar className={styles.iconOverrides} />
    </div>
  );
};

export default PeerCalendarIllustration;
