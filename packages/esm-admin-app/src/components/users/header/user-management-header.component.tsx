import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location, UserFollow } from '@carbon/react/icons';
import { formatDate, useSession, ServiceQueuesPictogram } from '@openmrs/esm-framework';
import styles from './header.scss';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;

  return (
    <div className={styles.header} id="admin-header">
      <div className={styles.leftJustifiedItems}>
        <ServiceQueuesPictogram />
        <div className={styles.pageLabels}>
          <p>{t('users', 'Users')}</p>
          <p className={styles.pageName}>{title}</p>
        </div>
      </div>
      <div className={styles.rightJustifiedItems}>
        <div className={styles.userContainer}>
          <p>{session?.user?.person?.display}</p>
          <UserFollow size={16} className={styles.userIcon} />
        </div>
        <div className={styles.dateAndLocation}>
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
