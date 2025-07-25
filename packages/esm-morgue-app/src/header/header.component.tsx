import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { ConfigurableLink, formatDate, PageHeader, PageHeaderContent, useSession } from '@openmrs/esm-framework';
import styles from './header.scss';
import { TwoPersonLift } from '@carbon/pictograms-react';

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <PageHeader className={styles.header}>
      <PageHeaderContent
        illustration={
          <ConfigurableLink to={`${window.getOpenmrsSpaBase()}home/morgue`}>
            <TwoPersonLift className={styles.mortuaryPictogram} />
          </ConfigurableLink>
        }
        title={title}
        className={styles.leftJustifiedItems}
      />
      <div className={styles.rightJustifiedItems}>
        <div className={styles.dateAndLocation}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </PageHeader>
  );
};

export default Header;
