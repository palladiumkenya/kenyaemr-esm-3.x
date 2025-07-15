import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import styles from '../bed.scss';

const Divider: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.dividerContainer}>
      <div className={styles.dividerLine}></div>
      <span className={styles.dividerText}>{t('dividerText', 'Shared')}</span>
      <div className={styles.dividerLine}></div>
    </div>
  );
};

export default Divider;
