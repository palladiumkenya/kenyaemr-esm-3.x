import { Button, Tag } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type PractitionerResponse } from '../../types';
import styles from './hwr-confirmation.modal.scss';

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
  healthWorker: PractitionerResponse;
}

const HWRConfirmModal: React.FC<HWRConfirmModalProps> = ({ close, onConfirm, healthWorker }) => {
  const { t } = useTranslation();
  const passportNumber = healthWorker?.link
    ?.find(
      (link: { relation: string; url: string }) =>
        link.relation === 'self' && link.url.includes('identifierType=Passport'),
    )
    ?.url.split('identifierNumber=')[1]
    ?.split('&')[0];

  const practitioner = healthWorker?.entry?.[0]?.resource;

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
              patientName: practitioner?.name?.[0]?.text || '',
            }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <HealthWorkerInfo
              label={t('healthWorkerName', 'Health worker name')}
              value={practitioner?.name?.[0]?.text}
            />

            {practitioner?.telecom?.map((telecom, index) => (
              <HealthWorkerInfo key={index} label={capitalize(telecom?.system)} value={telecom?.value || '--'} />
            ))}

            {practitioner?.identifier?.map((identifier, index) => (
              <HealthWorkerInfo
                key={index}
                label={identifier.type?.coding?.map((code) => code.display).join(' ') || '--'}
                value={identifier.value || '--'}
              />
            ))}

            {passportNumber && (
              <HealthWorkerInfo label={t('passportNumber', 'Passport Number')} value={passportNumber} />
            )}

            <HealthWorkerInfo
              label={t('renewalDate', 'Renewal Date')}
              value={
                practitioner?.identifier?.find((id) => id.type?.coding?.some((code) => code.code === 'license-number'))
                  ?.period?.end || '--'
              }
            />

            <HealthWorkerInfo
              label={t('licensingBody', 'Licensing Body')}
              value={
                practitioner?.qualification?.[0]?.extension?.find(
                  (ext) => ext.url === 'https://hwr-kenyahie/StructureDefinition/licensing-body',
                )?.valueCodeableConcept?.coding?.[0]?.display || '--'
              }
            />
            <HealthWorkerInfo
              label={t('qualification', 'Qualification')}
              value={
                practitioner?.qualification?.[0]?.code?.coding?.[0]?.display ||
                practitioner?.extension?.find((ext) => ext.url === 'https://ts.kenya-hie.health/Codesystem/specialty')
                  ?.valueCodeableConcept?.coding?.[0]?.display ||
                '--'
              }
            />

            <HealthWorkerInfo
              label={t('licenseValid', 'License Validity')}
              value={
                <Tag type={practitioner?.active ? 'green' : 'red'}>
                  {practitioner?.active ? t('licenseValid', 'License Valid') : t('licenseExpired', 'License Expired')}
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
