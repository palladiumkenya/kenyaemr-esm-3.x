import React from 'react';
import styles from './shr-summary.scss';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { launchWorkspace } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface SHRSummaryHeaderProps {}

const SHRSummaryHeader: React.FC<SHRSummaryHeaderProps> = () => {
  const { t } = useTranslation();
  const handleInitiateAuthorization = () => {
    launchWorkspace('shr-authorization-form', {
      workspaceTitle: 'SHR Pull Authorization Form',
    });
  };

  return (
    <div className={styles.headerContainer}>
      <h4>{t('shrPortal', 'SHR Portal')}</h4>
    </div>
  );
};

export default SHRSummaryHeader;
