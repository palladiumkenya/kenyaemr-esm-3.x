import { DataTableSkeleton } from '@carbon/react';
import { ConfigurableLink, useConfig, useSession } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../config-schema';
import useContacts from '../hooks/useContacts';
import { PeerCalendarHeader } from './header/peer-calendar-header.component';
import PeerCalendarMetricsHeader from './header/peer-calendar-metrics.component';
import GenericDataTable, { GenericTableEmptyState } from './table/generic-data-table';

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
  );
  const peersTitle = t('peers', 'Peers');
  return (
    <div className={`omrs-main-content`}>
      <PeerCalendarHeader title={t('peerCalendar', 'Peer Calendar')} />
      <PeerCalendarMetricsHeader />
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
            endDate: contact.endDate ?? '--',
            actions: '--',
          }))}
        />
      )}
    </div>
  );
};

export default PeerCalendar;
