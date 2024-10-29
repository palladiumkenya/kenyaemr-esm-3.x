import { Tag } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericDataTable from '../../../benefits-package/table/generic_data_table.component';
import { usePreAuthRequests } from '../../../hooks/use-pre-auth-requests';
import useShaData from './hook/table.resource';

type PreAuthTableProps = {
  status: 'active' | 'draft' | 'cancelled' | 'entered-in-error' | 'all';
};

const PreAuthTable: React.FC<PreAuthTableProps> = ({ status }) => {
  const { t } = useTranslation();
  const shaData = useShaData();
  const { preAuthRequests } = usePreAuthRequests();

  const headers = [
    { key: 'lastUpdatedAt', header: t('created', 'Created') },
    { key: 'insurer', header: t('insurer', 'Insurer') },
    { key: 'patientName', header: t('patientName', 'Patient Name') },
    { key: 'providerName', header: t('providerName', 'Provider Name') },
    { key: 'interventionCode', header: t('interventionCode', 'Intervention Code') },
    { key: 'status', header: t('status', 'Status') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  return (
    <GenericDataTable
      title={t('preAuthRequests', 'Pre-auth requests')}
      rows={preAuthRequests
        .filter((pr) => pr.status === status || status === 'all')
        .map((p) => ({
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
