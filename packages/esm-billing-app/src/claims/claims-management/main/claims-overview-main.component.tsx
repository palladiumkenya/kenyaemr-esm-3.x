import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClaimsManagementHeader } from '../header/claims-header.component';

const ClaimsManagementOverview = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <ClaimsManagementHeader title={t('claims', 'Claims')} />
    </div>
  );
};

export default ClaimsManagementOverview;
