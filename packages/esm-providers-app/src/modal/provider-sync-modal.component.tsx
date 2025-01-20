import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Column, Search, ComboBox, InlineLoading } from '@carbon/react';
import styles from './provider-sync-modal.scss';
import { Practitioner, ProviderResponse } from '../types';
import { useConfig, showSnackbar, formatDate, parseDate, showToast } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import {
  searchHealthCareWork,
  createProviderAttribute,
  updateProviderAttributes,
} from '../workspace/hook/provider-form.resource';
import { mutate } from 'swr';

interface HWRSyncModalProps {
  close: () => void;
  provider: ProviderResponse;
}

const HWRSyncModal: React.FC<HWRSyncModalProps> = ({ close, provider }) => {
  const { t } = useTranslation();
  const [syncLoading, setSyncLoading] = useState(false);

  const {
    providerNationalIdUuid,
    licenseBodyUuid,
    licenseExpiryDateUuid,
    passportNumberUuid,
    licenseNumberUuid,
    identifierTypes,
    phoneNumberUuid,
    qualificationUuid,
    providerAddressUuid,
    providerHieFhirReference,
  } = useConfig<ConfigObject>();

  const providerNationalId = provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid);
  const registrationNumber = provider.attributes.find((attr) => attr.attributeType.uuid === licenseBodyUuid);
  const passPortNumber = provider.attributes.find((attr) => attr.attributeType.uuid === passportNumberUuid);

  const [searchHWR, setSearchHWR] = useState({
    identifierType: identifierTypes[0]?.key,
    identifier: providerNationalId?.value,
  });

  const handleIdentifierTypeChange = (selectedItem: { key: string; name: string } | null) => {
    const selectedKey = selectedItem?.key ?? '';
    const identifierValue =
      selectedKey === identifierTypes[0]?.key
        ? providerNationalId?.value || '--'
        : selectedKey === identifierTypes[1]?.key
        ? registrationNumber?.value || '--'
        : selectedKey === identifierTypes[2]?.key
        ? passPortNumber?.value || '--'
        : '';

    setSearchHWR((prev) => ({
      ...prev,
      identifierType: selectedKey,
      identifier: identifierValue,
    }));
  };

  const isSearchDisabled = () => {
    const { identifierType } = searchHWR;
    return (
      (identifierType === identifierTypes[0]?.key && !providerNationalId?.value) ||
      (identifierType === identifierTypes[1]?.key && !registrationNumber?.value) ||
      (identifierType === identifierTypes[2]?.key && !passPortNumber?.value)
    );
  };

  const handleSync = async () => {
    try {
      setSyncLoading(true);

      const healthWorker: Practitioner = await searchHealthCareWork(searchHWR.identifierType, searchHWR.identifier);
      const licenseNumber = healthWorker.entry[0]?.resource.identifier?.find((id) =>
        id.type?.coding?.some((code) => code.code === 'license-number'),
      )?.value;
      const regNumber = healthWorker?.entry[0]?.resource.identifier?.find((id) =>
        id.type?.coding?.some((code) => code.code === 'board-registration-number'),
      )?.value;
      const licenseDate = formatDate(
        new Date(
          healthWorker?.entry[0]?.resource.identifier?.find((id) =>
            id.type?.coding?.some((code) => code.code === 'license-number'),
          )?.period?.end,
        ),
      );
      const phoneNumber = healthWorker?.entry[0]?.resource?.telecom?.find(
        (contact) => contact.system === 'phone',
      )?.value;
      const email = healthWorker?.entry[0]?.resource?.telecom?.find((contact) => contact.system === 'email')?.value;

      const qualification =
        healthWorker?.entry[0]?.resource?.qualification?.[0]?.code?.coding?.[0]?.display ||
        healthWorker?.entry[0]?.resource?.extension?.find(
          (ext) => ext.url === 'https://ts.kenya-hie.health/Codesystem/specialty',
        )?.valueCodeableConcept?.coding?.[0]?.display;

      const fhirBundle = JSON.stringify(healthWorker);

      const updatableAttributes = [
        {
          attributeType: licenseNumberUuid,
          value: licenseNumber,
        },
        {
          attributeType: licenseBodyUuid,
          value: regNumber,
        },
        {
          attributeType: licenseExpiryDateUuid,
          value: parseDate(licenseDate),
        },
        {
          attributeType: phoneNumberUuid,
          value: phoneNumber,
        },
        {
          attributeType: qualificationUuid,
          value: qualification,
        },
        {
          attributeType: providerHieFhirReference,
          value: fhirBundle,
        },
        {
          attributeType: providerAddressUuid,
          value: email,
        },
      ];

      await Promise.all(
        updatableAttributes.map((attr) => {
          const _attribute = provider.attributes.find((at) => at.attributeType.uuid === attr.attributeType)?.uuid;
          if (!_attribute) {
            return createProviderAttribute(attr, provider.uuid);
          }
          return updateProviderAttributes({ value: attr.value }, provider.uuid, _attribute);
        }),
      );

      mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/provider'));
      showSnackbar({ title: 'Success', kind: 'success', subtitle: t('syncmsg', 'Account synced successfully!') });
      close();
    } catch (err) {
      const { identifierType, identifier } = searchHWR;
      showToast({
        critical: false,
        kind: 'error',
        description: t('errorSyncMsg', `Failed to sync the account with ${identifier}. and ${err}`),
        title: t('hwrERROR', 'Sync Failed'),
        onActionButtonClick: () => close,
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('healthWorkerRegistry', 'Health worker registry')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>{t('healthWorkerSync', 'Health worker information to be synced with the registry.')}</p>
        <div className={styles.modalContainer}>
          <Column className={styles.identifierTypeColumn}>
            <ComboBox
              onChange={({ selectedItem }) => handleIdentifierTypeChange(selectedItem)}
              id="formIdentifierType"
              titleText={t('identificationType', 'Identification Type')}
              placeholder={t('chooseIdentifierType', 'Choose identifier type')}
              initialSelectedItem={identifierTypes.find((item) => item.key === searchHWR.identifierType)}
              items={identifierTypes}
              itemToString={(item) => (item ? item.name : '')}
              className={styles.ComboBox}
            />
          </Column>
          <Column className={styles.identifierTypeColumn}>
            <span className={styles.identifierTypeHeader}>{t('identifierNumber', 'Identifier number*')}</span>
            <Search
              className={styles.formSearch}
              value={searchHWR.identifier}
              placeholder={t('enterIdentifierNumber', 'Enter identifier number')}
              id="formSearchHealthWorkers"
              disabled={isSearchDisabled()}
              onChange={(value) => setSearchHWR({ ...searchHWR, identifier: value.target.value })}
            />
          </Column>
        </div>
      </div>
      <div className="cds--modal-footer">
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={isSearchDisabled() || syncLoading} onClick={handleSync}>
          {syncLoading ? <InlineLoading status="active" description={t('syncing', 'Syncing...')} /> : t('sync', 'Sync')}
        </Button>
      </div>
    </>
  );
};

export default HWRSyncModal;
