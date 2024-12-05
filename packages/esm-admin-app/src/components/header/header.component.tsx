import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { formatDate, useSession, PageHeader } from '@openmrs/esm-framework';
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
      <PageHeader
        title={t('etlAdministration', 'ETL Administration')}
        illustration={<ETLIllustration />}
        className={styles.header}
      />
    </div>
  );
};

export default Header;
