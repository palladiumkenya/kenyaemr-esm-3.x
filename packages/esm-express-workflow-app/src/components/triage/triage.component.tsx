import React from 'react';
import capitalize from 'lodash-es/capitalize';
import { PageHeader, HomePictogram } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';

import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './triage.scss';
import { useTranslation } from 'react-i18next';
import Card from '../../shared/cards/card.component';

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

  return (
    <div>
      <PageHeader className={styles.pageHeader} title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
      <div>
        <div className={styles.cards}>
          <Card title={t('patientInWaiting', 'Patient in waiting')} value={queues.length.toString()} />
          <Card title={t('patientAttended', 'Patient attended')} value={String(10)} />
        </div>
        <QueueTab queues={triageQueues} />
      </div>
    </div>
  );
};

export default Triage;
