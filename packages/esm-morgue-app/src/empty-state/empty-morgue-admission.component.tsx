import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './empty-morgue-admission.scss';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { DocumentUnknown, IbmWatsonKnowledgeStudio } from '@carbon/react/icons';
import { Tile } from '@carbon/react';

interface EmptyDeceasedSearchProps {
  title: string;
}

const EmptyMorgueAdmission: React.FC<EmptyDeceasedSearchProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <div className={styles.tileContent}>
          <p className={styles.content}>{title}</p>
          <p className={styles.emptyStateHelperText}>
            {t('checkFilters', 'Please check the filters above and try again')}
          </p>
        </div>
      </Tile>
    </div>
  );
};

export default EmptyMorgueAdmission;
