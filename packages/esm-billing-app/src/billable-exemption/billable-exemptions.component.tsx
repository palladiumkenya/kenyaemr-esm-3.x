import React from 'react';
import { useTranslation } from 'react-i18next';
import BillingHeader from '../billing-header/billing-header.component';
import { BillableExemptionsViewer } from '../billable-services/billable-exemptions/billable-exemptions-viewer.component';

export const BillableExemptions = () => {
  const { t } = useTranslation();
  return (
    <div>
      <BillingHeader title={t('billableExemptionAdministration', 'Exemption Administration')} />
      <BillableExemptionsViewer />
    </div>
  );
};
