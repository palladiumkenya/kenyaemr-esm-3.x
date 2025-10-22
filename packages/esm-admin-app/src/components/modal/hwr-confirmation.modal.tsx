import { Button, Tag } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomHIEPractitionerResponse, type PractitionerResponse } from '../../types';
import { NormalizedPractitioner } from '../hook/healthWorkerAdapter';
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
  healthWorker: CustomHIEPractitionerResponse | PractitionerResponse;
  normalizedData: NormalizedPractitioner;
  fhirFormat: boolean;
}

const HWRConfirmModal: React.FC<HWRConfirmModalProps> = ({
  close,
  onConfirm,
  healthWorker,
  normalizedData,
  fhirFormat,
}) => {
  const { t } = useTranslation();

  const isLicenseValid = normalizedData.licenseEndDate ? new Date(normalizedData.licenseEndDate) > new Date() : false;

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
              patientName: normalizedData.fullName || '',
            }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <HealthWorkerInfo
              label={t('healthWorkerName', 'Health worker name')}
              value={normalizedData.fullName || '--'}
            />

            <HealthWorkerInfo
              label={t('providerUniqueIdentifier', 'Provider unique identifier')}
              value={normalizedData.providerUniqueIdentifier || '--'}
            />

            <HealthWorkerInfo
              label={t('registrationId', 'Registration ID')}
              value={normalizedData.registrationId || '--'}
            />

            <HealthWorkerInfo
              label={t('externalReferenceId', 'External Reference ID')}
              value={normalizedData.externalReferenceId || '--'}
            />

            <HealthWorkerInfo label={t('gender', 'Gender')} value={normalizedData.gender || '--'} />

            <HealthWorkerInfo label={t('status', 'Status')} value={normalizedData.status || '--'} />

            {normalizedData.phoneNumber && (
              <HealthWorkerInfo label={t('phone', 'Phone')} value={normalizedData.phoneNumber} />
            )}

            {normalizedData.email && <HealthWorkerInfo label={t('email', 'Email')} value={normalizedData.email} />}

            {normalizedData.nationalId && (
              <HealthWorkerInfo
                label={t('identificationNumber', 'Identification Number')}
                value={normalizedData.nationalId}
              />
            )}

            <HealthWorkerInfo
              label={t('licensingBody', 'Licensing Body')}
              value={normalizedData.licensingBody || '--'}
            />

            <HealthWorkerInfo label={t('specialty', 'Specialty')} value={normalizedData.specialty || '--'} />

            {normalizedData.professionalCadre && (
              <HealthWorkerInfo
                label={t('professionalCadre', 'Professional Cadre')}
                value={normalizedData.professionalCadre}
              />
            )}

            {normalizedData.practiceType && (
              <HealthWorkerInfo label={t('practiceType', 'Practice Type')} value={normalizedData.practiceType} />
            )}

            {normalizedData.licenses && normalizedData.licenses.length > 0 && (
              <>
                <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <strong>{t('licenses', 'Licenses')}</strong>
                </div>
                {normalizedData.licenses.map((license, index) => (
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

            {normalizedData.licenseStartDate && normalizedData.licenseEndDate && (
              <HealthWorkerInfo
                label={t('licenseValidity', 'License Validity Period')}
                value={`${formatDateTime(normalizedData.licenseStartDate)} - ${formatDateTime(
                  normalizedData.licenseEndDate,
                )}`}
              />
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
