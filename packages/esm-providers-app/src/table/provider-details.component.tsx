import React from 'react';
import styles from './generic-data-table.scss';
import { useTranslation } from 'react-i18next';
import {
  StructuredListWrapper,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tile,
  Tag,
  Button,
} from '@carbon/react';
import { usePersonDetails, useProviderDetails, useProviderUser } from '../workspace/hook/provider-form.resource';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { Edit } from '@carbon/react/icons';
import { ExtensionSlot } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

interface ProviderDetailsProps {
  providerUuid: string;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ providerUuid }) => {
  const { t } = useTranslation();
  const { provider } = useProviderDetails(providerUuid);
  const { user, isLoading, error } = useProviderUser(providerUuid);

  const licenseAttr = provider?.attributes?.find((attr) => attr.attributeType.display === 'Practising License Number');
  const nationalID = provider?.attributes?.find((attr) => attr.attributeType.display === 'National ID');
  const dateAttr = provider?.attributes?.find((attr) => attr.attributeType.display === 'License Expiry Date');

  const formattedExpiryDate = dateAttr?.value ? dayjs(dateAttr.value).format('YYYY-MM-DD') : null;
  const today = dayjs();
  const expiryDate = dateAttr?.value ? dayjs(dateAttr.value) : null;
  const daysUntilExpiry = expiryDate ? expiryDate.diff(today, 'day') : null;

  let licenseStatus;

  if (!expiryDate) {
    licenseStatus = <Tag type="red">{t('missingExpiryDate', 'Missing expiry date')}</Tag>;
  } else if (daysUntilExpiry < 0) {
    licenseStatus = <Tag type="red">{t('licenseExpired', 'License has expired')}</Tag>;
  } else if (daysUntilExpiry <= 3) {
    licenseStatus = <Tag type="cyan">{t('licenseExpiringSoon', 'License is expiring soon')}</Tag>;
  } else {
    licenseStatus = <Tag type="green">{t('activeLicensed', 'Active License')}</Tag>;
  }

  if (isLoading) {
    return <div>{t('loading', 'Loading...')}</div>;
  }

  if (error) {
    return <div>{t('error', 'Error loading user details')}</div>;
  }

  return (
    <div className={styles.providerDetailsContainer}>
      <div>
        <div style={{ backgroundColor: 'white', width: '80%' }}>
          <CardHeader title={t('profileOverview', 'Profile overview')}>
            <></>
          </CardHeader>
        </div>
        <Tile style={{ backgroundColor: 'white', width: '80%' }}>
          <StructuredListWrapper>
            <StructuredListBody>
              <StructuredListRow>
                <StructuredListCell noWrap>
                  <br />
                  <ExtensionSlot
                    style={{
                      marginRight: '1rem',
                      marginTop: '2rem',
                    }}
                    name="patient-photo-slot"
                    state={{ patientName: user?.person?.display || t('unknown', 'Unknown') }}
                  />
                </StructuredListCell>
                <StructuredListCell>
                  {' '}
                  <div className={styles.providerDetails}>
                    <div className={styles.providerName}>{user?.person?.display}</div>
                    <div className={styles.demographics}>
                      {t('Gender', 'Gender')}: {user?.person?.gender}
                    </div>
                    <div className={styles.identifiers}>
                      <div>
                        <span>{t('nationalID', 'National ID')}: </span>
                        <span>
                          {nationalID?.value ? (
                            <Tag type="green">{nationalID.value}</Tag>
                          ) : (
                            <Tag type="red">{t('missingIDno', 'Missing National ID')}</Tag>
                          )}
                        </span>
                      </div>
                      <div>
                        <span>{t('licenseNumber', 'License Number')}: </span>
                        <span>
                          {licenseAttr?.value ? (
                            <Tag type="green">{licenseAttr.value}</Tag>
                          ) : (
                            <Tag type="red">{t('unlicensed', 'Unlicensed')}</Tag>
                          )}
                        </span>
                      </div>
                      <div>
                        <span>{t('expiryDate', 'Expiry Date')}: </span>
                        <span>
                          {formattedExpiryDate ? (
                            <>
                              <Tag type="blue">{formattedExpiryDate}</Tag>
                              {licenseStatus}
                            </>
                          ) : (
                            <Tag type="red">{t('missingExpiryDate', 'Missing Expiry Date')}</Tag>
                          )}
                        </span>
                      </div>
                      <div>
                        <span>{t('roles', 'Roles')}: </span>
                        <span>{user?.allRoles.map((role) => role.display).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </StructuredListCell>
              </StructuredListRow>
            </StructuredListBody>
          </StructuredListWrapper>
        </Tile>
      </div>
    </div>
  );
};

export default ProviderDetails;
