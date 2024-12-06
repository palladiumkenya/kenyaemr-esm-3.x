import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location, UserFollow } from '@carbon/react/icons';
import { useSession, formatDate } from '@openmrs/esm-framework';
import styles from './morgue-header.scss';
import MorgueIllustration from './morgue-illustration.component';
import { InlineLoading } from '@carbon/react';

interface MorgueHeaderProps {
  title: string;
}

export const MorgueHeader: React.FC<MorgueHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <MorgueIllustration />
        <div className={styles['page-labels']}>
          <p className={styles['page-name']}>{title}</p>
          <p>{t('mortuaryManagement', 'Mortuary management')}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{location}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};
