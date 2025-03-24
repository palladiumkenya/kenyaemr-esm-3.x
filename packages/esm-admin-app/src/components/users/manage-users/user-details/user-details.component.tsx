import React, { useRef } from 'react';
import styles from './user-detail.scss';
import { useTranslation } from 'react-i18next';
import { Tag, Accordion, AccordionItem, ContainedList, ContainedListItem } from '@carbon/react';
import { PatientPhoto } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import classNames from 'classnames';
import capitalize from 'lodash/capitalize';
import { type ProviderResponse, type UserResponse } from '../../../../types';

interface UserDetailsProps {
  provider: ProviderResponse;
  user: UserResponse;
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
  passportNumber: ProviderAttribute;
}

const UserDetails: React.FC<UserDetailsProps> = ({ provider, user }) => {
  const { t } = useTranslation();
  const patientBannerRef = useRef(null);

  const attributeMap = {
    licenseAttr: 'Practising License Number',
    nationalID: 'Provider National Id Number',
    dateAttr: 'License Expiry Date',
    phoneNumber: 'Provider Telephone',
    qualification: 'Provider Qualification',
    registrationNumber: 'License Body',
    emailAddress: 'Provider Address',
    passportNumber: 'Provider passport number',
  };

  const attributes: ProviderAttributes = Object.entries(attributeMap).reduce((acc, [key, display]) => {
    const attr = provider?.attributes?.find((attr) => attr.attributeType.display === display);
    if (attr) {
      acc[key as keyof ProviderAttributes] = { value: attr.value };
    }
    return acc;
  }, {} as ProviderAttributes);

  const {
    licenseAttr,
    nationalID,
    dateAttr,
    phoneNumber,
    qualification,
    registrationNumber,
    emailAddress,
    passportNumber,
  } = attributes;

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

  return (
    <div className={styles.providerDetailsContainer}>
      <header aria-label="patient banner" role="banner" ref={patientBannerRef}>
        <div className={styles.patientBanner}>
          <div className={styles.patientAvatar} role="img">
            <PatientPhoto patientUuid={provider?.uuid} patientName={provider?.person?.display} />
          </div>
          <div className={styles.patientInfo}>
            <div className={classNames(styles.row, styles.patientNameRow)}>
              <div className={styles.flexRow}>
                <span className={styles.patientName}>{provider?.person?.display} </span> &middot;
                <span className={styles.gender}>
                  {provider?.person?.gender === 'M' ? 'Male' : provider?.person?.gender === 'F' ? 'Female' : ''}{' '}
                  &middot;{' '}
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
                <span className={styles.spanField}>
                  {t('passportNumber', 'Passport number')}: {passportNumber?.value ? passportNumber.value : '--'}
                </span>
                <span className={styles.spanField}>
                  {t('licenseExpiryDate', 'License expiry date')}: {formattedExpiryDate ? formattedExpiryDate : '--'}
                </span>
              </div>
              <div className={classNames(styles.row, styles.patientNameRow, styles.viewRoles)}>
                <Accordion>
                  <AccordionItem title={t('viewRoles', 'View roles')}>
                    {user?.roles?.map((role, i) => (
                      <ContainedListItem key={i}>
                        <div className={styles.roleContainer}>
                          <strong>{role.display}</strong>
                          <p className={styles.roleDescription}>
                            {role.description || t('noDescriptionAvailable', 'No description available')}
                          </p>
                        </div>
                      </ContainedListItem>
                    ))}
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            <br />
          </div>
        </div>
      </header>
    </div>
  );
};

export default UserDetails;
