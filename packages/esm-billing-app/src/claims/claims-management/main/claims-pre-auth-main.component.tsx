import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimsPreAuthFilter } from '../../../types';
import { ClaimsManagementHeader } from '../header/claims-header.component';
import ClaimsFilterHeader from '../header/filter-header.component';
import PreAuthTable from '../table/pre-auth-table.component';
import PreauthTableTemporary from '../table/preauth-table.tmp.component';

const ClaimsManagementPreAuthRequest = () => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<ClaimsPreAuthFilter>({
    status: 'all',
  });

  const status = useMemo(
    () => [
      { value: 'all', label: t('all', 'All') },
      { value: 'draft', label: t('draft', 'Draft') },
      { value: 'active', label: t('active', 'Active') },
      { value: 'cancelled', label: t('cancelled', 'Cancelled') },
      { value: 'entered-in-error', label: t('enteredInError', 'Entered in error') },
    ],
    [t],
  );

  return (
    <div className="omrs-main-content">
      <ClaimsManagementHeader title={t('preAuthRequets', 'Pre-Auth Requests')} />
      {/* <ClaimsFilterHeader filters={filters} onFilterChanged={setFilters} statusOptions={status} /> */}
      <PreauthTableTemporary />
    </div>
  );
};

export default ClaimsManagementPreAuthRequest;
