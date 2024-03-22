import React from 'react';
import { ConnectReference } from '@carbon/react/icons';
import styles from './community-referrals-header.scss';

const CommunityReferralsIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <ConnectReference className={styles.iconOverrides} />
    </div>
  );
};

export default CommunityReferralsIllustration;
