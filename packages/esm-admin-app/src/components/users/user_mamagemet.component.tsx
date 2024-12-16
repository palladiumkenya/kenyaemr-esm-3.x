import React from 'react';
import Header from './header/header.component';
import { useTranslation } from 'react-i18next';

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <Header title={t('userManagement', 'User Management')} />
    </div>
  );
};
