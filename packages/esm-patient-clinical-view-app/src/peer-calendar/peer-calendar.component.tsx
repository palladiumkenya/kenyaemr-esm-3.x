import { DataTableSkeleton } from '@carbon/react';
import { ConfigurableLink, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePeers from '../hooks/usePeers';
import { PeerCalendarHeader } from './header/peer-calendar-header.component';
import PeerCalendarMetricsHeader from './header/peer-calendar-metrics.component';
import GenericDataTable, { GenericTableEmptyState } from './table/generic-data-table';
import {
  PeerCalendarActions,
  PeerCalendarStatus,
  PeerCalenderFiltersHeader,
} from './table/peer-calendar-table-components.component';

const PeerCalendar = () => {
  const { t } = useTranslation();
  const {
    user: {
      person: { uuid: peerEducatorUuid, display },
    },
  } = useSession();
  const { peers, error, isLoading } = usePeers(peerEducatorUuid);
  const peersTitle = t('peers', 'Peers');
  const timeStamp = new Date();
  const [reportigPeriod, setReportingPeriod] = useState({
    month: timeStamp.getMonth() + 1,
    year: timeStamp.getFullYear(),
  });
  const [completedPeers, setCompletedPeers] = useState<Array<string>>([]);
  const [filterStatus, setFilterStatus] = useState<'completed' | 'pending' | 'all'>();

  return (
    <div className={`omrs-main-content`}>
      <PeerCalendarHeader title={t('peerCalendar', 'Peer Calendar')} />
      <PeerCalendarMetricsHeader
        reportigPeriod={reportigPeriod}
        setReportingPeriod={setReportingPeriod}
        isLoading={isLoading}
        peers={peers}
        completedPeers={completedPeers}
      />
      {isLoading && <DataTableSkeleton />}
      {!isLoading && error && <ErrorState error={error} headerTitle={t('peerCalendar', 'Peer Calendar')} />}
      {!error && !isLoading && peers.length === 0 && (
        <GenericTableEmptyState
          headerTitle={peersTitle}
          displayText={t('nopeers', 'No peers to display for this peer educatpr')}
        />
      )}
      {!error && !isLoading && peers.length > 0 && (
        <GenericDataTable
          headers={[
            { header: 'Peer', key: 'name' },
            { header: 'Gender', key: 'gender' },
            { header: 'Contact', key: 'contact' },
            { header: 'Age', key: 'age' },
            { header: 'Start date', key: 'startDate' },
            { header: 'End date', key: 'endDate' },
            { header: 'Status', key: 'status' },
            { header: 'Actions', key: 'actions' },
          ]}
          title={t('peers', 'Peers')}
          rows={peers.map((peer) => ({
            ...peer,
            id: peer.relativeUuid,
            name: (
              <ConfigurableLink
                style={{ textDecoration: 'none' }}
                to={window.getOpenmrsSpaBase() + `patient/${peer.relativeUuid}/chart/Patient Summary`}>
                {peer.name}
              </ConfigurableLink>
            ),
            age: peer.age ?? '--',
            contact: peer.contact ?? '--',
            startDate: peer.patientUuid === peerEducatorUuid ? '--' : peer.startDate ?? '--',
            endDate: peer.patientUuid === peerEducatorUuid ? '--' : peer.endDate ?? '--',
            status: (
              <PeerCalendarStatus
                filterStatus={filterStatus}
                peer={peer}
                reportingPeriod={reportigPeriod}
                setCompletePeers={setCompletedPeers}
                completePeers={completedPeers}
              />
            ),
            actions: <PeerCalendarActions peer={peer} reportingPeriod={reportigPeriod} />,
          }))}
          renderActionComponent={() => (
            <PeerCalenderFiltersHeader filterStatus={filterStatus} onUpdateFilterStatus={setFilterStatus} />
          )}
        />
      )}
    </div>
  );
};

export default PeerCalendar;
