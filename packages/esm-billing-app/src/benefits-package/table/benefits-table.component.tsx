import { Button, DataTableSkeleton } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { getPatientUuidFromStore, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePreAuthRequests } from '../../hooks/use-pre-auth-requests';
import GenericDataTable from './generic_data_table.component';
import { formatDate, parseDate } from '@openmrs/esm-framework';

const headers = [
  {
    key: 'provider',
    header: 'Provider',
  },
  {
    key: 'insurer',
    header: 'Insurer',
  },
  {
    key: 'interventionCode',
    header: 'Product',
  },
  {
    key: 'lastUpdatedAt',
    header: 'Created',
  },
  {
    key: 'status',
    header: 'Approval status',
  },
  {
    key: 'action',
    header: 'Action',
  },
];

const BenefitsTable = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromStore();
  const { isLoading, preAuthRequests } = usePreAuthRequests();

  if (isLoading) {
    return (
      <DataTableSkeleton
        headers={headers}
        aria-label="patient bills table"
        showToolbar={false}
        showHeader={false}
        columnCount={Object.keys(headers).length}
        zebra
        rowCount={3}
      />
    );
  }

  const handleLaunchPreAuthForm = () => {
    launchPatientWorkspace('benefits-pre-auth-form', {
      workspaceTitle: 'Pre Auth Form',
      patientUuid,
    });
  };

  return (
    <>
      <GenericDataTable
        rows={preAuthRequests.map((r) => ({
          ...r,
          lastUpdatedAt: formatDate(parseDate(r.lastUpdatedAt)),
          provider: r.provider.name,
        }))}
        headers={headers}
        title={t('preAuthRequests', 'Pre Auth Requests')}
        renderActionComponent={() => (
          <Button kind="ghost" renderIcon={ArrowRight} onClick={handleLaunchPreAuthForm}>
            {t('makePreAuthRequests', 'Make Pre Auth Request')}
          </Button>
        )}
      />
    </>
  );
};

export default BenefitsTable;
