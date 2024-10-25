import { Button, DataTableSkeleton } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { getPatientUuidFromUrl, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePreAuthRequests } from '../../hooks/use-pre-auth-form';
import GenericDataTable from './generic_data_table.component';

const headers = [
  {
    key: 'packageCode',
    header: 'Package Code',
  },
  {
    key: 'packageName',
    header: 'Package Name',
  },
  {
    key: 'insurer',
    header: 'Insurer',
  },
  {
    key: 'interventionCode',
    header: 'Intervention Code',
  },
  {
    key: 'interventionName',
    header: 'Intervention Name',
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
  const patientUuid = getPatientUuidFromUrl();
  const { isLoading, preAuthRequests } = usePreAuthRequests(patientUuid);

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
    <GenericDataTable
      rows={preAuthRequests}
      headers={headers}
      title={t('preAuthRequests', 'Pre Auth Requests')}
      renderActionComponent={() => (
        <Button kind="ghost" renderIcon={ArrowRight} onClick={handleLaunchPreAuthForm}>
          {t('makePreAuthRequests', 'Make Pre Auth Request')}
        </Button>
      )}
    />
  );
};

export default BenefitsTable;
