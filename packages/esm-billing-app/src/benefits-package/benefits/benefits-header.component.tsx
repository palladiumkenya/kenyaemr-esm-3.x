import React from 'react';
import styles from './benefits.scss';
import { useTranslation } from 'react-i18next';
import { useShifIdentifiersData } from '../benefits-package.mock';

interface BenefitsHeaderProps {}

const BenefitsHeader: React.FC<BenefitsHeaderProps> = () => {
  const { t } = useTranslation();
  const shifIdentifiers = useShifIdentifiersData();

  return (
    <div className={styles.headerContainer}>
      <h4>{t('benefits', 'Benefits')}</h4>
      <div>
        <h6>{t('SHIF', 'Social Health Insurance Fund')}</h6>
        {shifIdentifiers.map((identifier) => (
          <h6 key={identifier.identiferNumber}>
            <span>{t('shaNo', 'SHA NUMBER: ')}</span>
            <span>{identifier.identiferNumber}</span>
          </h6>
        ))}
      </div>
    </div>
  );
};

export default BenefitsHeader;
