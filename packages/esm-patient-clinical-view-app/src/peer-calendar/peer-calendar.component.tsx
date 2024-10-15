import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PeerCalendarHeader } from './header/peer-calendar-header.component';
import PeerCalendarMetricsHeader from './metrics/peer-calendar-metrics.component';
import PeerCalendarTable from './table/peer-calendar-table.components';
import usePeers from '../hooks/usePeers';
import { useSession } from '@openmrs/esm-framework';

const PeerCalendar = () => {
  const { t } = useTranslation();
  const {
    user: {
      person: { uuid: peerEducatorUuid, display },
    },
  } = useSession();
  const timeStamp = new Date();
  const [reportigPeriod, setReportingPeriod] = useState({
    month: timeStamp.getMonth() + 1,
    year: timeStamp.getFullYear(),
  });
  const [completedPeers, setCompletedPeers] = useState<Array<string>>([]);
  const { peers, error, isLoading } = usePeers(peerEducatorUuid);
  return (
    <div className={`omrs-main-content`}>
      <PeerCalendarHeader
        title={t('peerCalendar', 'Peer Calendar')}
        reportigPeriod={reportigPeriod}
        onReportingPeriodChange={setReportingPeriod}
      />
      <PeerCalendarMetricsHeader
        reportigPeriod={reportigPeriod}
        setReportingPeriod={setReportingPeriod}
        isLoading={isLoading}
        peers={peers}
        completedPeers={completedPeers}
      />
      <PeerCalendarTable
        completedPeers={completedPeers}
        reportigPeriod={reportigPeriod}
        setCompletedPeers={setCompletedPeers}
        peers={peers}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default PeerCalendar;
