import { useSession } from '@openmrs/esm-framework';
import React from 'react';
import { type Attribute, useProviderAttributes } from './provider-banner.resource';
import styles from './provider-banner.module.scss';
import { InlineLoading, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import upperCase from 'lodash-es/upperCase';

const ProviderBannerTag: React.FC = () => {
  const { currentProvider } = useSession();
  const { t } = useTranslation();
  const currentProviderUuid = currentProvider?.uuid;
  const { isLoading, error, providerAttributes } = useProviderAttributes(currentProviderUuid);

  const getAttributeValue = (attributes: Array<Attribute>, displayName: string): string => {
    const attribute = attributes?.find((attr) => attr.attributeType.display === displayName);
    return attribute?.value || '';
  };

  const getLicenseStatus = (expiryDate: string) => {
    if (!expiryDate || expiryDate === '0000-00-00') {
      return { status: 'unknown', message: t('unlicensed', 'Unlicensed'), tagType: 'magenta' as const };
    }

    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'expired', message: t('licenseExpired', 'License Expired'), tagType: 'red' as const };
    } else if (daysDiff <= 30) {
      return { status: 'warning', message: t('expiresSoon', 'Expires Soon'), tagType: 'blue' as const };
    } else if (daysDiff <= 90) {
      return { status: 'caution', message: t('expiresIn3Months', 'Expires in 3 months'), tagType: 'teal' as const };
    } else {
      return { status: 'valid', message: t('validLicense', 'Valid License'), tagType: 'green' as const };
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '000-000-00') {
      return '0000-00-00';
    }
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '0000-00-00';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <InlineLoading description={t('loadingState', 'loading' + '...')} />
      </div>
    );
  }

  const name = upperCase(providerAttributes?.person?.display) || 'NONE';
  const hwi = getAttributeValue(providerAttributes?.attributes, 'Provider unique identifier') || 'NONE';
  const licenseExpiry = getAttributeValue(providerAttributes?.attributes, 'License Expiry Date');
  const formattedExpiry = formatDate(licenseExpiry) || '0000-00-00';
  const shouldShowLicenseExpiry = !!licenseExpiry;
  const licenseStatus = getLicenseStatus(licenseExpiry);

  return (
    <div className={styles.providerBanner}>
      <div className={styles.bannerContent}>
        <div className={styles.divider} />
        <div className={styles.infoItem}>
          <span className={styles.label}>
            {t('healthProviderUniqueIdentifier', 'Health Provider unique identifier' + ':')}
          </span>
          <span className={`${styles.value} ${styles.hwiValue}`}>{hwi}</span>
        </div>

        <div className={styles.divider} />

        <>
          <div className={styles.infoItem}>
            {shouldShowLicenseExpiry && (
              <>
                <span className={styles.label}>{t('licenseExpiry', 'License Expiry' + ':')}</span>
                <span className={styles.value}>{formattedExpiry}</span>
              </>
            )}

            <span className={styles.statusIndicator}>
              <Tag size="md" type={licenseStatus.tagType}>
                {licenseStatus.message}
              </Tag>
            </span>
          </div>

          <div className={styles.divider} />
        </>

        <div className={styles.infoItem}>
          <span className={styles.label}>{t('name', 'Name' + ':')}</span>
          <span className={styles.value}>{name}</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderBannerTag;
