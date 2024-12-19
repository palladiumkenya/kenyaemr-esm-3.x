import React from 'react';
import styles from './manage-user.scss';
import UserList from './user-list/user-list.component';
import { useTranslation } from 'react-i18next';
import Header from '../header/user-management-header.component';

const UserManagentLandingPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <div className={`omrs-main-content`}>
        <Header title={t('userManagement', 'User Management')} />
      </div>
      <UserList />
    </section>
  );
};

export default UserManagentLandingPage;
