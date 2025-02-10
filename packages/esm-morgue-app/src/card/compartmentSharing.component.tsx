import { SkeletonText, Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './compartmentSharing.scss';

interface CompartmentShareDividerProps {
  isLoading?: boolean;
}

const CompartmentShareDivider: React.FC<CompartmentShareDividerProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.compartmentDivider}>
      <div className={styles.compartmentDividerLine}></div>
      {isLoading ? <SkeletonText /> : <Tag>{t('sharing', 'Sharing')}</Tag>}
      <div className={styles.compartmentDividerLine}></div>
    </div>
  );
};

export default CompartmentShareDivider;
