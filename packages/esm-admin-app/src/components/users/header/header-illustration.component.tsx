import React from 'react';
import styles from './header.scss';
import { Events } from '@carbon/react/icons';

const UserManagementIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <Events className={styles.iconOveriders} />
    </div>
  );
};

export default UserManagementIllustration;
