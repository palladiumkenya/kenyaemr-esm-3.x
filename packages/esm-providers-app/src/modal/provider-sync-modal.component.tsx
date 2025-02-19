import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Column, Search, ComboBox, InlineLoading } from '@carbon/react';
import styles from './provider-sync-modal.scss';
import { Practitioner, ProviderResponse } from '../types';
import { useConfig, showSnackbar, formatDate, parseDate, showToast, restBaseUrl } from '@openmrs/esm-framework';
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

  const config = useConfig<ConfigObject>();
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
  } = config;

  const attributeMapping = {
    [identifierTypes[0]?.key]:
      provider.attributes.find((attr) => attr.attributeType.uuid === providerNationalIdUuid)?.value || '--',
    [identifierTypes[1]?.key]:
      provider.attributes.find((attr) => attr.attributeType.uuid === licenseBodyUuid)?.value || '--',
    [identifierTypes[2]?.key]:
      provider.attributes.find((attr) => attr.attributeType.uuid === passportNumberUuid)?.value || '--',
  };

  const [searchHWR, setSearchHWR] = useState({
    identifierType: identifierTypes[0]?.key,
    identifier: attributeMapping[identifierTypes[0]?.key],
  });

  const handleIdentifierTypeChange = (selectedItem: { key: string; name: string } | null) => {
    const selectedKey = selectedItem?.key ?? '';
    setSearchHWR((prev) => ({
      ...prev,
      identifierType: selectedKey,
      identifier: attributeMapping[selectedKey] || '',
    }));
  };

  const isSearchDisabled = () => !searchHWR.identifier;

  const handleSync = async () => {
    try {
      setSyncLoading(true);

      const healthWorker: Practitioner = await searchHealthCareWork(searchHWR.identifierType, searchHWR.identifier);
      const resource = healthWorker.entry[0]?.resource;

      const extractedAttributes = {
        licenseNumber: resource?.identifier?.find((id) =>
          id.type?.coding?.some((code) => code.code === 'license-number'),
        )?.value,
        regNumber: resource?.identifier?.find((id) =>
          id.type?.coding?.some((code) => code.code === 'board-registration-number'),
        )?.value,
        licenseDate: formatDate(
          new Date(
            resource?.identifier?.find((id) =>
              id.type?.coding?.some((code) => code.code === 'license-number'),
            )?.period?.end,
          ),
        ),
        phoneNumber: resource?.telecom?.find((contact) => contact.system === 'phone')?.value,
        email: resource?.telecom?.find((contact) => contact.system === 'email')?.value,
        qualification:
          resource?.qualification?.[0]?.code?.coding?.[0]?.display ||
          resource?.extension?.find((ext) => ext.url === 'https://ts.kenya-hie.health/Codesystem/specialty')
            ?.valueCodeableConcept?.coding?.[0]?.display,
      };

      const updatableAttributes = [
        { attributeType: licenseNumberUuid, value: extractedAttributes.licenseNumber },
        { attributeType: licenseBodyUuid, value: extractedAttributes.regNumber },
        { attributeType: licenseExpiryDateUuid, value: parseDate(extractedAttributes.licenseDate) },
        { attributeType: phoneNumberUuid, value: extractedAttributes.phoneNumber },
        { attributeType: qualificationUuid, value: extractedAttributes.qualification },
        { attributeType: providerHieFhirReference, value: JSON.stringify(healthWorker) },
        { attributeType: providerAddressUuid, value: extractedAttributes.email },
      ].filter((attr) => attr.value !== undefined && attr.value !== null && attr.value !== '');

      await Promise.all(
        updatableAttributes.map((attr) => {
          const existingAttribute = provider.attributes.find(
            (at) => at.attributeType.uuid === attr.attributeType,
          )?.uuid;
          if (!existingAttribute) {
            return createProviderAttribute(attr, provider.uuid);
          }
          return updateProviderAttributes({ value: attr.value }, provider.uuid, existingAttribute);
        }),
      );

      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));
      showSnackbar({
        title: 'Success',
        kind: 'success',
        subtitle: t('syncmsg', 'Account synced successfully!'),
      });
      close();
    } catch (err) {
      showToast({
        critical: false,
        kind: 'error',
        description: t('errorSyncMsg', `Failed to sync the account with ${searchHWR.identifier}. ${err}`),
        title: t('hwrERROR', 'Sync Failed'),
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
