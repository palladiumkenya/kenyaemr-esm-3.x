import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './empty-morgue-admission.scss';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { DocumentUnknown, IbmWatsonKnowledgeStudio } from '@carbon/react/icons';

interface EmptyDeceasedSearchProps {
  title: string;
  subTitle: string;
}

const EmptyMorgueAdmission: React.FC<EmptyDeceasedSearchProps> = ({ title, subTitle }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyStateContainer}>
      <IbmWatsonKnowledgeStudio className={styles.iconOverrides} />
      <p className={styles.title}>{title}</p>
      <p className={styles.subTitle}>{subTitle}</p>
    </div>
  );
};

export default EmptyMorgueAdmission;
