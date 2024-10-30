import React from 'react';
import styles from './benefits.scss';
import { useTranslation } from 'react-i18next';

interface BenefitsHeaderProps {}

const BenefitsHeader: React.FC<BenefitsHeaderProps> = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.headerContainer}>
      <h4>{t('benefitsHeader', 'Benefits')}</h4>
      <div>
        <h6>{t('SHIF', 'Social Health Insurance Fund')}</h6>
        <h6>
          <span> {t('shifNo', 'SHIF NUMBER:')}</span>
          <span>32JFFN23B</span>
        </h6>
      </div>
    </div>
  );
};

export default BenefitsHeader;
