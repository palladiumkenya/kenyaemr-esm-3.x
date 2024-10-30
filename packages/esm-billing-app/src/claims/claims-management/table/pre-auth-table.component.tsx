import { DataTableSkeleton, Tag } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericDataTable from '../../../benefits-package/table/generic_data_table.component';
import { usePreAuthRequests } from '../../../hooks/use-pre-auth-requests';
import useShaData from './hook/table.resource';
import { ClaimsPreAuthFilter } from '../../../types';

type PreAuthTableProps = {
  filters: ClaimsPreAuthFilter;
};

const PreAuthTable: React.FC<PreAuthTableProps> = ({ filters }) => {
  const { t } = useTranslation();
  const shaData = useShaData();
  const { preAuthRequests, isLoading, error } = usePreAuthRequests();
  const title = t('preAuthRequests', 'Pre-auth requests');

  const headers = [
    { key: 'lastUpdatedAt', header: t('created', 'Created') },
    { key: 'insurer', header: t('insurer', 'Insurer') },
    { key: 'patientName', header: t('patientName', 'Patient Name') },
    { key: 'providerName', header: t('providerName', 'Provider Name') },
    { key: 'interventionCode', header: t('interventionCode', 'Intervention Code') },
    { key: 'status', header: t('status', 'Status') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={title} />;
  }

  const filteredPreauth = preAuthRequests.filter((pr) => {
    const status = filters?.status;
    const search = filters?.search?.toLowerCase();
    const fromDate = filters?.fromDate ? new Date(filters.fromDate) : null;
    const toDate = filters?.toDate ? new Date(filters.toDate) : null;
    const patientName = pr.patient.name.toLowerCase();
    const providerName = pr.provider.name.toLowerCase();
    const timeStamp = new Date(pr.lastUpdatedAt);
    const preauthStatus = pr.status;

    // Check status (allow 'all' to bypass the filter)
    const statusMatch = preauthStatus === status || status === 'all';

    // Check search filter (patient name or provider name contains the search term)
    const searchMatch = !search || patientName.includes(search) || providerName.includes(search);

    // Check date range filter (timestamp is between fromDate and toDate if provided)
    const dateMatch = (!fromDate || timeStamp >= fromDate) && (!toDate || timeStamp <= toDate);

    // Return true if all conditions match
    return statusMatch && searchMatch && dateMatch;
  });

  if (filteredPreauth.length < 1) {
    return <EmptyState headerTitle={title} displayText={status === 'all' ? 'Preauths' : `${status} preauths`} />;
  }

  return (
    <GenericDataTable
      title={title}
      rows={filteredPreauth.map((p) => ({
        ...p,
        patientName: p.patient.name,
        providerName: p.provider.name,
        lastUpdatedAt: formatDate(parseDate(p.lastUpdatedAt)),
        status: <Tag>{p.status}</Tag>,
      }))}
      headers={headers}
    />
  );
};

export default PreAuthTable;
