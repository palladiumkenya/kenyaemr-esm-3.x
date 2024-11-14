import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './empty-state.scss';

interface EmptySearchProps {
  title: string;
  subTitle: string;
  icon: React.ReactNode;
}

const EmptyProviderState: React.FC<EmptySearchProps> = ({ title, subTitle, icon }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyStateContainer}>
      <div>{icon}</div>
      <p className={styles.title}>{title}</p>
      <p className={styles.subTitle}>{subTitle}</p>
    </div>
  );
};

export default EmptyProviderState;
