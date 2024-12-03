import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, IbmCloudant, Location, UserFollow } from '@carbon/react/icons';
import { formatDate, useSession } from '@openmrs/esm-framework';
import styles from './header.scss';
import ETLIllustration from './header-illustration.component';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <ETLIllustration />
        <div className={styles['page-labels']}>
          <p>{t('etlAdministration', 'ETL Administration')}</p>
          <p className={styles['page-name']}>{title}</p>
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

export default Header;
