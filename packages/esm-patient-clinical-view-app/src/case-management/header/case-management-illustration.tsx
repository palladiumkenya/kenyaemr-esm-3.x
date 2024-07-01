import React from 'react';
import { ChartRelationship } from '@carbon/react/icons';
import styles from './case-management-header.scss';

const CaseManagementIllustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <ChartRelationship className={styles.iconOverrides} />
    </div>
  );
};

export default CaseManagementIllustration;
