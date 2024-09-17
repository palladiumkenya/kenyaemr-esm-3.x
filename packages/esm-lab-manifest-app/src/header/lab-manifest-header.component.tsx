import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate } from '@openmrs/esm-framework';
import styles from './lab-manifest-header.scss';
import LabManifestIllustration from './lab-manifest-illustration.component';

interface LabManifestHeaderProps {
  title: string;
}
export const LabManifestHeader: React.FC<LabManifestHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['leftJustifiedItems']}>
        <LabManifestIllustration />
        <div className={styles['pageLabels']}>
          <p>{t('labManifest', 'Lab Manifest')}</p>
          <p className={styles['pageName']}>{title}</p>
        </div>
      </div>
      <div className={styles['rightJustifieditems']}>
        <div className={styles['dateAndLocation']}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};
