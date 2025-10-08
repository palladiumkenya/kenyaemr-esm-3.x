import { Button, Tag } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomHIEPractitionerResponse, type PractitionerResponse } from '../../types';
import styles from './hwr-confirmation.modal.scss';
import { formatDateTime } from '../../utils/utils';

interface HealthWorkerInfoProps {
  label: string;
  value: string | boolean | React.ReactNode;
}

const HealthWorkerInfo: React.FC<HealthWorkerInfoProps> = ({ label, value }) => {
  return (
    <div className={styles.healthWorkerInfoContainer}>
      <span className={styles.healthWorkerInfoLabel}>{label}</span>
      <span>{value}</span>
    </div>
  );
};

interface HWRConfirmModalProps {
  onConfirm: () => void;
  close: () => void;
  healthWorker: CustomHIEPractitionerResponse;
}

const HWRConfirmModal: React.FC<HWRConfirmModalProps> = ({ close, onConfirm, healthWorker }) => {
  const { t } = useTranslation();

  const { membership, licenses, contacts, identifiers, professional_details } = healthWorker?.message || {};

  const mostRecentLicense = licenses
    ?.filter((l) => l.license_end)
    .sort((a, b) => new Date(b.license_end).getTime() - new Date(a.license_end).getTime())[0];

  const isLicenseValid = mostRecentLicense?.license_end ? new Date(mostRecentLicense.license_end) > new Date() : false;

  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('healthWorkerRegistry', 'Health worker registry')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>
          {t(
            'healthWorkerDetailsFound',
            'Health worker information found in the registry, do you want to use the information to continue with registration?',
          )}
        </p>
        <div className={styles.healthWorkerOverview}>
          <ExtensionSlot
            className={styles.healthWorkerPhoto}
            name="patient-photo-slot"
            state={{
              patientName: membership?.full_name || '',
            }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <HealthWorkerInfo
              label={t('healthWorkerName', 'Health worker name')}
              value={membership?.full_name || '--'}
            />

            <HealthWorkerInfo
              label={t('providerUniqueIdentifier', 'Provider unique identifier')}
              value={membership?.id || '--'}
            />

            <HealthWorkerInfo
              label={t('registrationId', 'Registration ID')}
              value={membership?.registration_id || '--'}
            />

            <HealthWorkerInfo
              label={t('externalReferenceId', 'External Reference ID')}
              value={membership?.external_reference_id || '--'}
            />

            <HealthWorkerInfo label={t('gender', 'Gender')} value={membership?.gender || '--'} />

            <HealthWorkerInfo label={t('status', 'Status')} value={membership?.status || '--'} />

            {contacts?.phone && <HealthWorkerInfo label={t('phone', 'Phone')} value={contacts.phone} />}

            {contacts?.email && <HealthWorkerInfo label={t('email', 'Email')} value={contacts.email} />}

            {identifiers?.identification_number && (
              <HealthWorkerInfo
                label={identifiers.identification_type || t('identificationNumber', 'Identification Number')}
                value={identifiers.identification_number}
              />
            )}

            <HealthWorkerInfo label={t('licensingBody', 'Licensing Body')} value={membership?.licensing_body || '--'} />

            <HealthWorkerInfo
              label={t('specialty', 'Specialty')}
              value={membership?.specialty || professional_details?.specialty || '--'}
            />

            {professional_details?.professional_cadre && (
              <HealthWorkerInfo
                label={t('professionalCadre', 'Professional Cadre')}
                value={professional_details.professional_cadre}
              />
            )}

            {professional_details?.practice_type && (
              <HealthWorkerInfo label={t('practiceType', 'Practice Type')} value={professional_details.practice_type} />
            )}

            {licenses && licenses.length > 0 && (
              <>
                <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <strong>{t('licenses', 'Licenses')}</strong>
                </div>
                {licenses.map((license, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                    <HealthWorkerInfo
                      label={`${license.license_type} ${t('license', 'License')}`}
                      value={license.external_reference_id || '--'}
                    />
                    <HealthWorkerInfo
                      label={t('validity', 'Validity')}
                      value={`${formatDateTime(license.license_start)} - ${formatDateTime(license.license_end)}`}
                    />
                  </div>
                ))}
              </>
            )}

            <HealthWorkerInfo
              label={t('licenseValid', 'License Validity')}
              value={
                <Tag type={isLicenseValid ? 'green' : 'red'}>
                  {isLicenseValid ? t('licenseValid', 'License Valid') : t('licenseExpired', 'License Expired')}
                </Tag>
              }
            />
          </div>
        </div>
      </div>
      <div className="cds--modal-footer">
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={onConfirm}>{t('useValues', 'Use values')}</Button>
      </div>
    </>
  );
};

export default HWRConfirmModal;
