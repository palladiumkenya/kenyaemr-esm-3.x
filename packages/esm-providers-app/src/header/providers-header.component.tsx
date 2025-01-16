import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate, PageHeader } from '@openmrs/esm-framework';
import styles from './providers-header.scss';
import ProvidersIllustration from './providers-illustration.component';

export const ProvidersHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.header}>
        <PageHeader title={t('providerManagement', 'Providers Management')} illustration={<ProvidersIllustration />} />
      </div>
    </>
  );
};
