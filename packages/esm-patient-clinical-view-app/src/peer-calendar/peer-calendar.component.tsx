import React from 'react';
import { PeerCalendarHeader } from './header/peer-calendar-header.component';
import { useTranslation } from 'react-i18next';
import PeerCalendarMetricsHeader from './header/peer-calendar-metrics.component';

const PeerCalendar = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <PeerCalendarHeader title={t('peerCalendar', 'Peer Calendar')} />
      <PeerCalendarMetricsHeader />
    </div>
  );
};

export default PeerCalendar;
