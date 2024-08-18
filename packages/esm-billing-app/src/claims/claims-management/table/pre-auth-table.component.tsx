import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericDataTable from '../generic-table/generic-table.component';

const PreAuthTable: React.FC = () => {
  const { t } = useTranslation();

  const headers = [
    { key: 'visitTime', header: t('visitTime', 'Visit Time') },
    { key: 'patientName', header: t('patientName', 'Patient Name') },
    { key: 'preAuthCode', header: t('preAuthCode', 'Pre-Auth Code') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const rows = [
    {
      id: '1',
      visitTime: '2024-08-17 09:00 AM',
      patientName: 'John Doe',
      preAuthCode: 'PRE123456',
      status: 'Pending',
    },
    {
      id: '2',
      visitTime: '2024-08-17 10:00 AM',
      patientName: 'Jane Smith',
      preAuthCode: 'PRE654321',
      status: 'Approved',
    },
  ];

  const switchTabs = [
    { name: t('approved', 'Approved'), component: '' },
    { name: t('noApproved', 'Not Approved'), component: '' },
  ];

  return (
    <GenericDataTable
      cardTitle={t('preAuthRequests', 'Pre-auth requests')}
      contentSwitcherTabs={switchTabs}
      rows={rows}
      headers={headers}
      bills={[]}
      renderExpandedRow={(row) => <div></div>}
    />
  );
};

export default PreAuthTable;
