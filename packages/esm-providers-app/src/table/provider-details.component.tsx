import React, { useRef } from 'react';
import styles from './provider-details.scss';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { useProviderDetails, useProviderUser } from '../workspace/hook/provider-form.resource';
import { PatientPhoto } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import classNames from 'classnames';
import capitalize from 'lodash/capitalize';

interface ProviderDetailsProps {
  providerUuid: string;
}

interface ProviderAttribute {
  value: string;
}

interface ProviderAttributes {
  licenseAttr?: ProviderAttribute;
  nationalID?: ProviderAttribute;
  dateAttr?: ProviderAttribute;
  phoneNumber?: ProviderAttribute;
  qualification?: ProviderAttribute;
  registrationNumber?: ProviderAttribute;
  emailAddress?: ProviderAttribute;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ providerUuid }) => {
  const { t } = useTranslation();
  const patientBannerRef = useRef(null);
  const { provider } = useProviderDetails(providerUuid);
  const { user, isLoading, error } = useProviderUser(providerUuid);

  const attributeMap = {
    licenseAttr: 'Practising License Number',
    nationalID: 'Provider National Id Number',
    dateAttr: 'License Expiry Date',
    phoneNumber: 'Provider Telephone',
    qualification: 'Provider Qualification',
    registrationNumber: 'License Body',
    emailAddress: 'Provider Address',
  };

  const attributes: ProviderAttributes = Object.entries(attributeMap).reduce((acc, [key, display]) => {
    const attr = provider?.attributes?.find((attr) => attr.attributeType.display === display);
    if (attr) {
      acc[key as keyof ProviderAttributes] = { value: attr.value };
    }
    return acc;
  }, {} as ProviderAttributes);

  const { licenseAttr, nationalID, dateAttr, phoneNumber, qualification, registrationNumber, emailAddress } =
    attributes;

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
            <div className={classNames(styles.row, styles.patientNameRow)}>
              <div className={styles.flexRow}>
                <span className={styles.patientName}>{user?.person?.display} </span> &middot;
                <span className={styles.gender}>
                  {user?.person?.gender === 'M' ? 'Male' : user?.person?.gender === 'F' ? 'Female' : ''} &middot;{' '}
                </span>
                <span className={styles.statusTag}>{getLicenseStatusTag()}</span>
                <span className={styles.statusTag}>
                  {qualification?.value && <Tag type="cyan">{capitalize(qualification?.value)}</Tag>}
                </span>
              </div>
            </div>

            <div className={classNames(styles.row, styles.patientNameRow)}>
              <div className={styles.flexRow}>
                <span className={styles.spanField}>
                  {t('phoneNumber', 'Phone number')}: {phoneNumber?.value ? phoneNumber.value : '--'}
                </span>
                <span className={styles.middot}>&middot; </span>

                <span className={styles.spanField}>
                  {t('emailAddress', 'Email address')}: {emailAddress?.value ? emailAddress.value : '--'}
                </span>
              </div>
            </div>
            <div className={classNames(styles.row, styles.patientNameRow)}>
              <div className={styles.flexRow}>
                <span className={styles.spanField}>
                  {t('nationalId', 'National ID')}: {nationalID?.value ? nationalID.value : '--'}
                </span>
                <span className={styles.middot}>&middot; </span>

                <span className={styles.spanField}>
                  {t('licenseNumber', 'License number')}: {licenseAttr?.value ? licenseAttr.value : '--'}
                </span>
                <span className={styles.middot}>&middot; </span>
                <span className={styles.spanField}>
                  {t('registrationNumber', 'Registration number')}:{' '}
                  {registrationNumber?.value ? registrationNumber.value : '--'}
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
