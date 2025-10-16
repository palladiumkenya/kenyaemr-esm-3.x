import React from 'react';
import { useTranslation } from 'react-i18next';
import { FacilityPictogram, PageHeaderContent, ExtensionSlot, PageHeader } from '@openmrs/esm-framework';

import styles from './referrals-header.scss';

export const ReferralsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageHeader className={styles.header}>
      <PageHeaderContent title={t('referrals', 'Referrals')} illustration={<FacilityPictogram />} />
      <ExtensionSlot name="provider-banner-info-slot" />
    </PageHeader>
  );
};
