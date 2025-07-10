import React from 'react';
import { DataTableSkeleton, ContentSwitcher, Switch } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink, ErrorState } from '@openmrs/esm-framework';
import styles from './summary.scss';
import MetricsCard from '../metrics/metrics-card.component';

const Summary: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.cardContainer}>
        <MetricsCard
          headerLabel={t('awaitingAdmissionHeader', 'Awaiting Admission')}
          label={t('totalCount', 'total')}
          value={'0'}
        />
        <MetricsCard headerLabel={t('admittedHeader', 'Admitted')} label={t('totalCount', 'total')} value={'0'} />
        <MetricsCard headerLabel={t('dischargedHeader', 'Discharged')} label={t('totalCount', 'total')} value={'0'} />
      </div>
    </>
  );
};

export default Summary;
