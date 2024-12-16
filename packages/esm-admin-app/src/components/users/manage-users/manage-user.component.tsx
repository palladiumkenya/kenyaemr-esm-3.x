import React from 'react';
import styles from './manage-user.scss';
import UserList from './user-list/user-list.component';

export default function UserManagentLandingPage() {
  const basePath = `${window.getOpenmrsSpaBase()}stock-management`;
  return (
    <main className={styles.servicesTableContainer}>
      <UserList />
    </main>
  );
}
