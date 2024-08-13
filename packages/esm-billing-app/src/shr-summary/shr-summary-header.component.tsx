import React from 'react';
import styles from './shr-summary.scss';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';

interface SHRSummaryHeaderProps {}

const SHRSummaryHeader: React.FC<SHRSummaryHeaderProps> = () => {
  const handleInitiateAuthorization = () => {
    launchWorkspace('shr-authorization-form', {
      workspaceTitle: 'SHR Pull Authorization Form',
    });
  };

  return (
    <div className={styles.headerContainer}>
      <h4>SHR Summary</h4>
      <Button kind="primary" renderIcon={ArrowRight} onClick={handleInitiateAuthorization}>
        Pull Patient SHR Data
      </Button>
    </div>
  );
};

export default SHRSummaryHeader;
