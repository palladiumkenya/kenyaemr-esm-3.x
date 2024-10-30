import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimsPreAuthFilter } from '../../../types';
import { ClaimsManagementHeader } from '../header/claims-header.component';
import ClaimsFilterHeader from '../header/filter-header.component';
import PreAuthTable from '../table/pre-auth-table.component';

const ClaimsManagementPreAuthRequest = () => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<ClaimsPreAuthFilter>({
    status: 'all',
  });

  return (
    <div className="omrs-main-content">
      <ClaimsManagementHeader title={t('preAuthRequets', 'Pre-Auth Requests')} />
      <ClaimsFilterHeader filters={filters} onFilterChanged={setFilters} />
      <PreAuthTable filters={filters} />
    </div>
  );
};

export default ClaimsManagementPreAuthRequest;
