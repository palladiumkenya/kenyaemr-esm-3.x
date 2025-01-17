import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { displayName, ExtensionSlot, formatDate } from '@openmrs/esm-framework';
import { Practitioner } from '../types';
import capitalize from 'lodash/capitalize';
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
  const passportNumber = healthWorker?.link
    ?.find(
      (link: { relation: string; url: string }) =>
        link.relation === 'self' && link.url.includes('identifierType=Passport'),
    )
    ?.url.split('identifierNumber=')[1]
    ?.split('&')[0];

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
        <div style={{ display: 'flex', margin: '1rem' }}>
          <ExtensionSlot
            style={{ display: 'flex', alignItems: 'center' }}
            name="patient-photo-slot"
            state={{
              patientName: healthWorker?.entry[0]?.resource?.name[0]?.text || '',
            }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <HealthWorkerInfo
              label={t('healthWorkerName', 'Health worker name')}
              value={healthWorker?.entry[0]?.resource?.name[0]?.text}
            />

            {healthWorker?.entry[0]?.resource?.telecom?.map((telecom, index) => (
              <HealthWorkerInfo key={index} label={capitalize(telecom?.system)} value={telecom?.value || ''} />
            ))}

            {healthWorker?.entry[0]?.resource?.identifier?.map((identifier, index) => (
              <HealthWorkerInfo
                key={index}
                label={identifier.type?.coding?.map((code) => code.display).join(' ') || t('unknown', 'Unknown')}
                value={identifier.value || t('unknown', 'Unknown')}
              />
            ))}

            {passportNumber && (
              <HealthWorkerInfo label={t('passportNumber', 'Passport Number')} value={passportNumber} />
            )}

            <HealthWorkerInfo
              label={t('renewalDate', 'Renewal Date')}
              value={formatDate(
                new Date(
                  healthWorker?.entry[0]?.resource.identifier?.find((id) =>
                    id.type?.coding?.some((code) => code.code === 'license-number'),
                  )?.period?.end || t('unknown', 'Unknown'),
                ),
              )}
            />

            <HealthWorkerInfo
              label={t('licensingBody', 'Licensing Body')}
              value={
                healthWorker?.entry[0]?.resource?.qualification?.[0]?.extension?.find(
                  (ext) => ext.url === 'https://hwr-kenyahie/StructureDefinition/licensing-body',
                )?.valueCodeableConcept?.coding?.[0]?.display || t('unknown', 'Unknown')
              }
            />
            <HealthWorkerInfo
              label={t('qualification', 'Qualification')}
              value={
                healthWorker?.entry[0]?.resource?.qualification?.[0]?.code?.coding?.[0]?.display ||
                healthWorker?.entry[0]?.resource?.extension?.find(
                  (ext) => ext.url === 'https://ts.kenya-hie.health/Codesystem/specialty',
                )?.valueCodeableConcept?.coding?.[0]?.display ||
                t('unknown', 'Unknown')
              }
            />

            <HealthWorkerInfo
              label={t('licenseValid', 'License Validity')}
              value={
                <Tag type={healthWorker?.entry[0]?.resource?.active ? 'green' : 'red'}>
                  {healthWorker?.entry[0]?.resource?.active
                    ? t('licenseValid', 'License Valid')
                    : t('licenseExpired', 'License Expired')}
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
