import React from 'react';
import { useTranslation } from 'react-i18next';
import { Development } from '@carbon/react/icons';
import { useSession, PageHeader } from '@openmrs/esm-framework';
import styles from './header.scss';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <PageHeader title={title} illustration={<Development size={32} />} className={styles.header} />
    </div>
  );
};

export default Header;
