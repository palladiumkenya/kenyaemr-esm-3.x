import { DataTableSkeleton } from '@carbon/react';
import { ConfigurableLink, useConfig, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';
import useContacts from '../hooks/useContacts';
import { PeerCalendarHeader } from './header/peer-calendar-header.component';
import PeerCalendarMetricsHeader from './header/peer-calendar-metrics.component';
import GenericDataTable, { GenericTableEmptyState } from './table/generic-data-table';
import { PeerCalendarActions, PeerCalendarStatus } from './table/peer-calendar-table-components.component';

const PeerCalendar = () => {
  const { t } = useTranslation();
  const {
    user: {
      person: { uuid: peerEducatorUuid, display },
    },
  } = useSession();
  const { peerEducatorRelationship } = useConfig<ConfigObject>();
  const { contacts, error, isLoading } = useContacts(
    peerEducatorUuid,
    (rel) => rel.relationshipType.uuid === peerEducatorRelationship,
    true,
  );
  const peersTitle = t('peers', 'Peers');
  const timeStamp = new Date();
  const [reportigPeriod, setReportingPeriod] = useState({
    month: timeStamp.getMonth() + 1,
    year: timeStamp.getFullYear(),
  });
  const [completedPeers, setCompletedPeers] = useState<Array<string>>([]);

  return (
    <div className={`omrs-main-content`}>
      <PeerCalendarHeader title={t('peerCalendar', 'Peer Calendar')} />
      <PeerCalendarMetricsHeader
        reportigPeriod={reportigPeriod}
        setReportingPeriod={setReportingPeriod}
        isLoading={isLoading}
        contacts={contacts}
        completedPeers={completedPeers}
      />
      {isLoading && <DataTableSkeleton />}
      {!isLoading && error && <ErrorState error={error} headerTitle={t('peerCalendar', 'Peer Calendar')} />}
      {!error && !isLoading && contacts.length === 0 && (
        <GenericTableEmptyState
          headerTitle={peersTitle}
          displayText={t('nopeers', 'No peers to display for this peer educatpr')}
        />
      )}
      {!error && !isLoading && contacts.length > 0 && (
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
          rows={contacts.map((contact) => ({
            ...contact,
            id: contact.relativeUuid,
            name: (
              <ConfigurableLink
                style={{ textDecoration: 'none' }}
                to={window.getOpenmrsSpaBase() + `patient/${contact.relativeUuid}/chart/Patient Summary`}>
                {contact.name}
              </ConfigurableLink>
            ),
            age: contact.age ?? '--',
            contact: contact.contact ?? '--',
            startDate: contact.patientUuid === peerEducatorUuid ? '--' : contact.startDate ?? '--',
            endDate: contact.patientUuid === peerEducatorUuid ? '--' : contact.endDate ?? '--',
            status: (
              <PeerCalendarStatus
                contact={contact}
                reportingPeriod={reportigPeriod}
                setCompletePeers={setCompletedPeers}
                completePeers={completedPeers}
              />
            ),
            actions: <PeerCalendarActions contact={contact} reportingPeriod={reportigPeriod} />,
          }))}
        />
      )}
    </div>
  );
};

export default PeerCalendar;
