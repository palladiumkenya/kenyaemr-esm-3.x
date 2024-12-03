import React from 'react';
import { ConnectReference } from '@carbon/react/icons';
import styles from './referrals-header.scss';

const ReferralsIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <ConnectReference className={styles.iconOverrides} />
    </div>
  );
};

export default ReferralsIllustration;
