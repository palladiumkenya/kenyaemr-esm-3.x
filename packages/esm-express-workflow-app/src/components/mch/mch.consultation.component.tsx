import { InlineLoading } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useServiceQueues';
import Card from '../../shared/cards/card.component';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './mch.scss';
type ConsultationProps = {
  dashboardTitle: string;
};

const MCHConsultation: React.FC = () => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const consultationQueues = queues.filter((queue) => queue.name.toLowerCase().includes('consultation'));

  if (isLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }
  return (
    <div>
      <div className={styles.cards}>
        <Card title={t('awaitingConsultation', 'Awaiting consultation')} value={'20'} />
        <Card title={t('awaitingInvestigation', 'Awaiting Investigation')} value={'5'} />
        <Card title={t('investigationComplete', 'Investigation complete')} value={'7'} />
        <Card title={t('visitComplete', 'Visit complete')} value={'4'} />
      </div>
      <QueueTab queues={consultationQueues} navigatePath="mch" />
    </div>
  );
};

export default MCHConsultation;
