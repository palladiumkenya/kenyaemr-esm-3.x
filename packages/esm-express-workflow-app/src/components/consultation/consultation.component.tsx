import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useServiceQueues';
import { InlineLoading } from '@carbon/react';
import { ExtensionSlot, HomePictogram, PageHeader, PageHeaderContent } from '@openmrs/esm-framework';
import styles from './consultation.scss';
import capitalize from 'lodash-es/capitalize';
import QueueTab from '../../shared/queue/queue-tab.component';
import { spaBasePath } from '../../constants';
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
    <div className={`omrs-main-content`}>
      <PageHeader className={styles.pageHeader}>
        <PageHeaderContent title={capitalize(dashboardTitle)} illustration={<HomePictogram />} />
        <ExtensionSlot name="provider-banner-info-slot" />
      </PageHeader>
      <QueueTab queues={consultationQueues} cards={cards} usePatientChart={usePatientChart} />
    </div>
  );
};

export default Consultation;
