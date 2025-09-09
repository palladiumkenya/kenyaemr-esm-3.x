import { InlineLoading } from '@carbon/react';
import React from 'react';

import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useServiceQueues';
import Card from '../../shared/cards/card.component';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './mch.scss';

const MCHTriage: React.FC = () => {
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
      <div className={styles.cards}>
        <Card title={t('patientInWaiting', 'Patient in waiting')} value={queues.length.toString()} />
        <Card title={t('patientAttended', 'Patient attended')} value={String(10)} />
      </div>
      <QueueTab queues={triageQueues} navigatePath="mch" />
    </div>
  );
};

export default MCHTriage;
