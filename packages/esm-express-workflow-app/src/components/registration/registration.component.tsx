import React from 'react';
import styles from './registration.scss';
import { PageHeader, PageHeaderContent } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import SearchBar from './search-bar/search-bar.component';
import IllustrationSvg from './illustration-svg/illustration.component';

const Registration: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={`omrs-main-content`}>
      <PageHeader className={styles.header} data-testid="patient-queue-header">
        <PageHeaderContent title={t('registration', 'Registration')} illustration={<IllustrationSvg />} />
      </PageHeader>
      <SearchBar />
    </div>
  );
};

export default Registration;
