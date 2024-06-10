import React from 'react';
import { useTranslation } from 'react-i18next';
import ClaimsHeader from './claims-header/claims-header.component';

const ClaimScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <ClaimsHeader />
    </>
  );
};

export default ClaimScreen;
