import { InlineLoading } from '@carbon/react';
import { HomePictogram, PageHeader } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useServiceQueues';
import QueueTab from '../../shared/queue/queue-tab.component';
import styles from './consultation.scss';
type ConsultationProps = {
  dashboardTitle: string;
};

const Consultation: React.FC<ConsultationProps> = ({ dashboardTitle }) => {
  const { t } = useTranslation();
  const { queues, isLoading, error } = useQueues();
  const consultationQueues = queues.filter((queue) => queue.name.toLowerCase().includes('consultation'));
  const usePatientChart = true;

  // TODO: Add actually get the values from the queues
  const cards = [
    { title: t('awaitingConsultation', 'Awaiting consultation'), value: '20' },
    { title: t('awaitingInvestigation', 'Awaiting Investigation'), value: '5' },
    { title: t('investigationComplete', 'Investigation complete'), value: '7' },
    { title: t('visitComplete', 'Visit complete'), value: '4' },
  ];

  if (isLoading) {
    return <InlineLoading description={t('loadingQueues', 'Loading queues...')} />;
  }
  return (
    <div>
      <PageHeader className={styles.pageHeader} title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
      <QueueTab
        queues={consultationQueues}
        cards={cards}
        navigatePath="consultation"
        usePatientChart={usePatientChart}
      />
    </div>
  );
};

export default Consultation;
