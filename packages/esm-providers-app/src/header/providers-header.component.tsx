import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate } from '@openmrs/esm-framework';
import styles from './providers-header.scss';
import ProvidersIllustration from './providers-illustration.component';
import { MetricCard } from './providers-metrics.component';

interface ProviderHeaderProps {
  title: string;
  summarize: {
    all: number;
    active: number;
    expired: number;
    missingNationalId: number;
    missingLicenseOrExpiry: number;
  };
}
export const ProvidersHeader: React.FC<ProviderHeaderProps> = ({ title, summarize }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header__section__container}>
      <div className={styles.left__justified__items}>
        <ProvidersIllustration />
        <div className={styles.page__label}>
          <p className={styles.page__name}>{title}</p>
          <p>{t('providerManagement', 'Providers Management')}</p>
        </div>
      </div>
      <div className={styles.metrics__header}>
        <MetricCard label={t('all', 'All')} value={summarize.all} />
        <MetricCard label={t('actives', 'Active')} value={summarize.active} />
        <MetricCard label={t('expiredlscs', 'Expiring license(s)')} value={summarize.expired} />
        <MetricCard label={t('missingLicenses', 'Missing license(s)')} value={summarize.missingLicenseOrExpiry} />
        <MetricCard label={t('missingNational', 'Missing national id')} value={summarize.missingNationalId} />

        <div className={styles.warp__metrics}>
          <div className={styles.metricLocationDate}>
            <span className={styles.location}>
              <Location size={16} /> {userLocation}
            </span>
            <span className={styles.date}>
              <Calendar size={16} /> {formatDate(new Date(), { mode: 'standard' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
