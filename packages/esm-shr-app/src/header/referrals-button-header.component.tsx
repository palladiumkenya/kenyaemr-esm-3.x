import React from 'react';
import { useTranslation } from 'react-i18next';
import { AirlineManageGates, UpdateNow } from '@carbon/react/icons';
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
          renderIcon={(props) => <UpdateNow size={20} {...props} />}
          iconDescription={t('pullReferrals', 'Pull Referrals')}
          onClick={pullReferrals}
          disabled={isLoadingFacilityReferrals}>
          {t('pullReferrals', 'Pull Referrals')}
        </Button>
        <Button
          kind="tertiary"
          renderIcon={(props) => <AirlineManageGates size={20} {...props} />}
          iconDescription={t('referralPatient', 'Refer Patient')}>
          {t('referralPatient', 'Refer Patient')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
