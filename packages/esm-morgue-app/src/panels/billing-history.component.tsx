import React from 'react';
import { ExtensionSlot, navigate, usePatient } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

const BillingHistoryView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <EmptyState displayText={'Billing history'} headerTitle={t('billingHistory', 'Billing history')} />
    </div>
  );
};

export default BillingHistoryView;
