import { DataTableSkeleton } from '@carbon/react';
import { ConfigurableLink, formatDate, parseDate, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Peer, ReportingPeriod } from '../../types';
import GenericDataTable, { GenericTableEmptyState } from './../table/generic-data-table';
import PeerCalendarActions from './peer-calendar-actions.component';
import PeerCalendarTableFilter from './peer-calendar-table-filter.component';
import PeerCompletionStatus from './peer-completion-status.component';
import { filterActivePeersWithDate } from '../peer-calendar.resources';

interface PeerCalendarTableProps {
  reportigPeriod?: Partial<ReportingPeriod>;
  completedPeers?: Array<string>;
  setCompletedPeers: React.Dispatch<React.SetStateAction<string[]>>;
  peers?: Array<Peer>;
  isLoading?: boolean;
  error?: any;
}

const PeerCalendarTable: React.FC<PeerCalendarTableProps> = ({
  reportigPeriod,
  completedPeers,
  setCompletedPeers,
  peers = [],
  isLoading = false,
  error,
}) => {
  const { t } = useTranslation();
  const {
    user: {
      person: { uuid: peerEducatorUuid, display },
    },
  } = useSession();
  const peersTitle = t('peers', 'Peers');
  const [filterStatus, setFilterStatus] = useState<'completed' | 'pending' | 'all'>();

  const [filteredPeers, setFilteredPeers] = useState<Array<Peer>>([]);

  useEffect(() => {
    const filter = filterStatus ?? 'all';
    const filtered = peers.filter((peer) => filterActivePeersWithDate(peer, reportigPeriod));
    if (filter === 'all') {
      setFilteredPeers(filtered ?? []);
    } else if (filter === 'completed') {
      setFilteredPeers((filtered ?? []).filter((peer) => completedPeers.includes(peer.patientUuid)));
    } else {
      setFilteredPeers((filtered ?? [])?.filter((peer) => !completedPeers.includes(peer.patientUuid)));
    }
  }, [filterStatus, completedPeers, peers, reportigPeriod]);

  useEffect(() => {
    setFilterStatus(null);
  }, [reportigPeriod]);

  return (
    <>
      {isLoading && <DataTableSkeleton />}
      {!isLoading && error && <ErrorState error={error} headerTitle={t('peerCalendar', 'Peer Calendar')} />}
      {!error && !isLoading && peers.length === 0 && (
        <GenericTableEmptyState
          headerTitle={peersTitle}
          displayText={t('nopeers', 'No peers to display for this peer educator')}
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
          rows={filteredPeers.map((peer) => ({
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
            startDate:
              peer.patientUuid === peerEducatorUuid
                ? '--'
                : peer.startDate
                ? formatDate(parseDate(peer.startDate))
                : '--',
            endDate:
              peer.patientUuid === peerEducatorUuid ? '--' : peer.endDate ? formatDate(parseDate(peer.endDate)) : '--',
            status: (
              <PeerCompletionStatus
                peer={peer}
                reportingPeriod={reportigPeriod}
                setCompletePeers={setCompletedPeers}
                completePeers={completedPeers}
              />
            ),
            actions: <PeerCalendarActions peer={peer} reportingPeriod={reportigPeriod} />,
          }))}
          renderActionComponent={() => (
            <PeerCalendarTableFilter filterStatus={filterStatus} onUpdateFilterStatus={setFilterStatus} />
          )}
        />
      )}
    </>
  );
};

export default PeerCalendarTable;
