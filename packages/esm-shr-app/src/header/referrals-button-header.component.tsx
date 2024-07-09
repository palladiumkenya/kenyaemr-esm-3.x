import React from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentView, Filter } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import styles from './referrals-header.scss';

interface MetricsHeaderProps {
  pullReferrals: () => void;
  isLoadingFacilityReferrals: boolean;
}

const MetricsHeader: React.FC<MetricsHeaderProps> = ({ pullReferrals, isLoadingFacilityReferrals }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.actionBtn}>
        <Button
          kind="primary"
          renderIcon={(props) => <Filter size={16} {...props} />}
          iconDescription={t('pullReferrals', 'Pull Referrals')}
          onClick={pullReferrals}
          disabled={isLoadingFacilityReferrals}>
          {t('pullReferrals', 'Pull Referrals')}
        </Button>
        <Button
          kind="tertiary"
          renderIcon={(props) => <DocumentView size={16} {...props} />}
          iconDescription={t('view', 'View Departmental summaries')}>
          {t('view', 'View Departmental summaries')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
