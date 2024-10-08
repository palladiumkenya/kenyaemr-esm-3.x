import { Calendar, EventSchedule, Location } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportingPeriod } from '../../types';
import styles from './peer-calendar-header.scss';
import ReportingPeriodInput from './reporting-period-input.component';

interface PeerCalendarHeaderProps {
  title: string;
  reportigPeriod: Partial<ReportingPeriod>;
  onReportingPeriodChange: React.Dispatch<React.SetStateAction<ReportingPeriod>>;
}
export const PeerCalendarHeader: React.FC<PeerCalendarHeaderProps> = ({
  title,
  onReportingPeriodChange,
  reportigPeriod,
}) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <EventSchedule className={styles.illustration} />
        <div className={styles['page-labels']}>
          <p>{t('managePeers', 'Manage Peers')}</p>
          <p className={styles['page-name']}>{title}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
        <ReportingPeriodInput onReportingPeriodChange={onReportingPeriodChange} reportigPeriod={reportigPeriod} />
      </div>
    </div>
  );
};
