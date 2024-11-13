import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { displayName, ExtensionSlot } from '@openmrs/esm-framework';
import { Practitioner } from '../types';
import { boolean } from 'zod';

interface HealthWorkerInfoProps {
  label: string;
  value: string | boolean | React.ReactNode;
}

const HealthWorkerInfo: React.FC<HealthWorkerInfoProps> = ({ label, value }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.25fr 0.75fr', margin: '0.25rem' }}>
      <span style={{ minWidth: '5rem', fontWeight: 'bold' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
};

interface HWRConfirmModalProps {
  onConfirm: () => void;
  close: () => void;
  healthWorker: Practitioner;
}

const HWRConfirmModal: React.FC<HWRConfirmModalProps> = ({ close, onConfirm, healthWorker }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('healthWorkerRegistry', `Health worker registry`)}</h3>
      </div>
      <div className="cds--modal-content">
        <p>
          {t(
            'healthWorkerDetailsFound',
            'Health worker information found in the registry, do you want to use the information to continue with registration?',
          )}
        </p>
        <div style={{ display: 'flex', margin: '1rem' }}>
          <ExtensionSlot
            style={{ display: 'flex', alignItems: 'center' }}
            name="patient-photo-slot"
            state={{ patientName: `${healthWorker?.name?.[0]?.given?.join(' ')} ${healthWorker?.name?.[0]?.family}` }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <HealthWorkerInfo label={t('healthWorkerName', 'Health worker name')} value={displayName(healthWorker)} />
            {healthWorker?.telecom?.map((telecom, index) => (
              <HealthWorkerInfo key={index} label={telecom.system} value={telecom.use || ''} />
            ))}
            {healthWorker?.identifier?.map((identifier, index) => (
              <HealthWorkerInfo
                key={index}
                label={identifier.type?.coding?.map((code) => code.code).join('') || 'Unknown'}
                value={identifier.value || 'Unknown'}
              />
            ))}
            <HealthWorkerInfo
              label={t('licenseNo', 'License Number')}
              value={
                healthWorker?.identifier?.find((id) => id.type?.coding?.some((code) => code.code === 'license-number'))
                  ?.value
              }
            />
            <HealthWorkerInfo
              label={t('renewalDuration', 'Renewal duration')}
              value={healthWorker?.qualification[0]?.code?.period?.end || 'Unknown'}
            />
            <HealthWorkerInfo
              label={t('licensingBody', 'Licensing Body')}
              value={
                healthWorker?.identifier?.find((id) =>
                  id.type?.coding?.some((code) => code.code === 'board-registration-number'),
                )?.value
              }
            />
            <HealthWorkerInfo
              label={t('qualificationType', 'Qualification Type')}
              value={
                healthWorker?.qualification[0]?.code?.coding.find(
                  (coding) =>
                    coding.system === 'https://ts.kenya-hie.health/Codesystem/regulatory-body' &&
                    coding.display === 'Kenya Medical Practitioners and Dentists Council',
                )?.display || 'Unknown'
              }
            />
            <HealthWorkerInfo
              label={t('licenseValid', 'License validity')}
              value={
                <Tag type={healthWorker?.active ? 'green' : 'red'}>
                  {healthWorker?.active ? 'license valid' : 'license expired'}
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
