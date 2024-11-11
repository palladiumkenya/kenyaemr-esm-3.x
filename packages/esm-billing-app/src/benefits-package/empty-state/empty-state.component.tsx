import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './empty-state.scss';
import { Report } from '@carbon/react/icons';

interface EmptyStateearchProps {
  title: string;
  subTitle: string;
}

const EmptyStateSearch: React.FC<EmptyStateearchProps> = ({ title, subTitle }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyStateContainer}>
      <Report className={styles.iconOverrides} />
      <p className={styles.title}>{title}</p>
      <p className={styles.subTitle}>{subTitle}</p>
    </div>
  );
};

export default EmptyStateSearch;
