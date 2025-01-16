import React, { useRef } from 'react';
import styles from './provider-details.scss';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { useProviderDetails, useProviderUser } from '../workspace/hook/provider-form.resource';
import { PatientPhoto } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import classNames from 'classnames';

interface ProviderDetailsProps {
  providerUuid: string;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ providerUuid }) => {
  const { t } = useTranslation();
  const patientBannerRef = useRef(null);
  const { provider } = useProviderDetails(providerUuid);
  const { user, isLoading, error } = useProviderUser(providerUuid);

  const licenseAttr = provider?.attributes?.find((attr) => attr.attributeType.display === 'Practising License Number');
  const nationalID = provider?.attributes?.find((attr) => attr.attributeType.display === 'Provider National Id Number');
  const dateAttr = provider?.attributes?.find((attr) => attr.attributeType.display === 'License Expiry Date');

  const formattedExpiryDate = dateAttr?.value ? dayjs(dateAttr.value).format('YYYY-MM-DD') : null;
  const today = dayjs();
  const expiryDate = dateAttr?.value ? dayjs(dateAttr.value) : null;
  const daysUntilExpiry = expiryDate ? expiryDate.diff(today, 'day') : null;

  const getLicenseStatusTag = () => {
    if (!licenseAttr?.value) {
      return <Tag type="red">{t('unlicensed', 'Unlicensed')}</Tag>;
    }

    if (daysUntilExpiry < 0) {
      return <Tag type="red">{t('licenseExpired', 'License has expired')}</Tag>;
    } else if (daysUntilExpiry <= 3) {
      return (
        <>
          <Tag type="cyan">{t('licenseExpiringSoon', 'License is expiring soon')}</Tag>
        </>
      );
    } else {
      return <Tag type="green">{t('active', 'Active')}</Tag>;
    }
  };

  if (isLoading) {
    return <div>{t('loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div>{t('error', 'Error loading user details')}</div>;
  }

  return (
    <div className={styles.providerDetailsContainer}>
      <header aria-label="patient banner" role="banner" ref={patientBannerRef}>
        <div className={styles.patientBanner}>
          <div className={styles.patientAvatar} role="img">
            <PatientPhoto patientUuid={user?.uuid} patientName={user?.person?.display} />
          </div>
          <div className={styles.patientInfo}>
            {/* Patient Name, Gender, and License Status */}
            <div className={classNames(styles.row, styles.patientNameRow)}>
              <div className={styles.flexRow}>
                <span className={styles.patientName}>{user?.person?.display} </span> &middot;
                <span className={styles.gender}>
                  {user?.person?.gender === 'M' ? 'Male' : user?.person?.gender === 'F' ? 'Female' : ''} &middot;{' '}
                </span>
                <span className={styles.statusTag}>{getLicenseStatusTag()}</span>
              </div>
            </div>

            {/* National ID and License Number */}
            <div className={classNames(styles.row, styles.patientNameRow)}>
              <div className={styles.flexRow}>
                <span className={styles.nationalId}>
                  {t('nationalId', 'National ID')}: {nationalID?.value ? nationalID.value : '--'}
                </span>
                <span className={styles.middot}>&middot; </span>

                <span className={styles.nationalId}>
                  {t('licenseNumber', 'License number')}: {licenseAttr?.value ? licenseAttr.value : '--'}
                </span>
              </div>
            </div>
            <br />
          </div>
        </div>
      </header>
    </div>
  );
};

export default ProviderDetails;
