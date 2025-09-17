import React from 'react';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { PageHeader, HomePictogram, ErrorState, PageHeaderContent, ExtensionSlot } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';

import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './triage.scss';

type TriageProps = {
  dashboardTitle: string;
};

const Triage: React.FC<TriageProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const triageQueues = queues
    .filter((queue) => queue.name.toLowerCase().includes('triage'))
    .filter((queue) => !queue.location.display.toLowerCase().includes('mch'))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (isLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('errorLoadingQueues', 'Error loading queues')} />;
  }

  return (
    <div className={`omrs-main-content`}>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />

        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>{' '}
      <QueueTab queues={triageQueues} />
    </div>
  );
};

export default Triage;
