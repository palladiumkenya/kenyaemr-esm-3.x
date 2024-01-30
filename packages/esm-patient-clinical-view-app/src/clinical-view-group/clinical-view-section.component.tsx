import React from 'react';
import styles from './clinical-view-section.scss';
import { useTranslation } from 'react-i18next';
import { Information } from '@carbon/react/icons';

type ClinicalViewSectionProps = {};

export const ClinicalViewSection: React.FC<ClinicalViewSectionProps> = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <span>{t('clinicalViews', 'Clinical views')}</span>
      <Information size={16} />
    </div>
  );
};

export default ClinicalViewSection;
