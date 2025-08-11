import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, navigate, UserHasAccess } from '@openmrs/esm-framework';
import { Movement, Return, ShareKnowledge } from '@carbon/react/icons';
import React from 'react';

import styles from './actionButton.scss';
import { useParams } from 'react-router-dom';

interface ActionButtonProps {
  patientUuid: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const handleNavigateToHomePage = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/morgue`,
    });

  return (
    <div className={styles.actionButton}>
      <UserHasAccess privilege="o3 : View Mortuary Dashboard">
        <Button kind="primary" size="sm" renderIcon={Return} onClick={handleNavigateToHomePage}>
          {t('backToHome', 'Back to Home')}
        </Button>
      </UserHasAccess>
    </div>
  );
};

export default ActionButton;
