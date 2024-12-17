import React from 'react';
import { useTranslation } from 'react-i18next';
import { WatsonHealthStressBreathEditor } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import styles from './case-management-header.scss';
import { launchWorkspace, useSession } from '@openmrs/esm-framework';

interface MetricsHeaderProps {
  activeTabIndex: number;
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({ activeTabIndex }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const metricsTitle = t(' ', 'Case Manager');
  const handleAddCase = () => {
    launchWorkspace('case-management-form', {
      workspaceTitle: 'Case Management Form',
    });
  };

  const isDiscontinuationTab = activeTabIndex === 1;

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.actionBtn}>
        <Button
          kind="tertiary"
          renderIcon={(props) => <WatsonHealthStressBreathEditor size={16} {...props} />}
          iconDescription={t('addCase', 'Add case')}
          onClick={handleAddCase}
          disabled={isDiscontinuationTab}>
          {t('addCase', 'Add case')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
