import { InlineLoading } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const MCHConsultation: React.FC = () => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const consultationQueues = queues.filter(
    (queue) =>
      queue.name.toLowerCase().includes('consultation') && queue.location.display.toLowerCase().includes('mch'),
  );
  if (isLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }

  if (!consultationQueues.length) {
    return (
      <EmptyState
        headerTitle={t('mchConsultationQueues', 'MCH Consultation Queues')}
        displayText={t('mchConsultationQueues', 'MCH Consultation Queues')}
      />
    );
  }
  return (
    <QueueTab
      queues={consultationQueues}
      navigatePath="mch"
      cards={[
        { title: t('awaitingInvestigation', 'Awaiting Investigation'), value: '12' },
        { title: t('investigationComplete', 'Investigation complete'), value: '8' },
        { title: t('visitComplete', 'Visit complete'), value: '5' },
      ]}
    />
  );
};

export default MCHConsultation;
