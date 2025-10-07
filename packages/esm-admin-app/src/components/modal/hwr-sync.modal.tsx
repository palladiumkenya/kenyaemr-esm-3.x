import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Column, Search, ComboBox, InlineLoading } from '@carbon/react';
import styles from './hwr-sync.modal.scss';
import { useConfig, showSnackbar, formatDate, parseDate, showToast, restBaseUrl } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { CustomHIEPractitionerResponse, type PractitionerResponse, type ProviderResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import { searchHealthCareWork } from '../hook/searchHealthCareWork';
import { createProviderAttribute, updateProviderAttributes } from './hwr-sync.resource';

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
    providerUniqueIdentifierAttributeTypeUuid,
    regulatorOptions,
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
    regulator: regulatorOptions[0]?.key,
  });

  const handleIdentifierTypeChange = (selectedItem: { key: string; name: string } | null) => {
    const selectedKey = selectedItem?.key ?? '';
    setSearchHWR((prev) => ({
      ...prev,
      identifierType: selectedKey,
      identifier: attributeMapping[selectedKey] || '',
    }));
  };

  const handleRegulatorChange = (selectedItem: { key: string; name: string } | null) => {
    const selectedKey = selectedItem?.key ?? '';
    setSearchHWR((prev) => ({
      ...prev,
      regulator: selectedKey,
    }));
  };

  const isSearchDisabled = () => !searchHWR.identifier;

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      const healthWorker: CustomHIEPractitionerResponse = await searchHealthCareWork(
        searchHWR.identifierType,
        searchHWR.identifier,
        searchHWR.regulator,
      );

      if (!healthWorker?.message) {
        throw new Error(t('noResults', 'No results found'));
      }

      const { membership, licenses, contacts, identifiers } = healthWorker.message;

      const mostRecentLicense = licenses
        ?.filter((l) => l.license_end)
        .sort((a, b) => new Date(b.license_end).getTime() - new Date(a.license_end).getTime())[0];

      const extractedAttributes = {
        licenseNumber: membership.external_reference_id,
        regNumber: membership.registration_id,
        licenseDate: mostRecentLicense?.license_end ? formatDate(new Date(mostRecentLicense.license_end)) : null,
        phoneNumber: contacts.phone,
        email: contacts.email,
        qualification: membership.specialty,
        nationalId: identifiers.identification_number,
        providerUniqueIdentifier: membership.id,
      };

      const updatableAttributes = [
        { attributeType: licenseNumberUuid, value: extractedAttributes.licenseNumber },
        { attributeType: licenseBodyUuid, value: extractedAttributes.regNumber },
        {
          attributeType: licenseExpiryDateUuid,
          value: extractedAttributes.licenseDate ? parseDate(extractedAttributes.licenseDate) : null,
        },
        { attributeType: phoneNumberUuid, value: extractedAttributes.phoneNumber },
        { attributeType: qualificationUuid, value: extractedAttributes.qualification },
        {
          attributeType: providerHieFhirReference,
          value: JSON.stringify({
            ...healthWorker,
            searchParameters: {
              regulator: searchHWR.regulator,
              identifierType: searchHWR.identifierType,
            },
          }),
        },
        { attributeType: providerAddressUuid, value: extractedAttributes.email },
        { attributeType: providerNationalIdUuid, value: extractedAttributes.nationalId },
        {
          attributeType: providerUniqueIdentifierAttributeTypeUuid,
          value: extractedAttributes.providerUniqueIdentifier,
        },
      ].filter((attr) => attr.value !== undefined && attr.value !== null && attr.value !== '');

      await Promise.all(
        updatableAttributes.map((attr) => {
          const existingAttribute = provider.attributes.find(
            (at) => at.attributeType.uuid === attr.attributeType,
          )?.uuid;

          const payload = {
            attributeType: attr.attributeType,
            value: attr.value,
          };

          if (!existingAttribute) {
            return createProviderAttribute(payload, provider.uuid);
          }
          return updateProviderAttributes(payload, provider.uuid, existingAttribute);
        }),
      );

      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/provider`));
      showSnackbar({
        title: 'Success',
        kind: 'success',
        subtitle: t('syncMessage', 'user details synced successfully'),
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
            <ComboBox
              onChange={({ selectedItem }) => handleRegulatorChange(selectedItem)}
              id="regulatorOptions"
              titleText={t('regulator', 'Regulator')}
              placeholder={t('chooseRegulator', 'Choose regulator')}
              initialSelectedItem={regulatorOptions.find((item) => item.key === searchHWR.regulator)}
              items={regulatorOptions}
              itemToString={(item) => (item ? item.name : '')}
              className={styles.ComboBox}
            />
          </Column>
          <Column className={styles.identifierTypeColumn}>
            <span className={styles.identifierTypeHeader}>{t('identifierNumber', 'Identifier number*')}</span>
            <Search
              labelText={t('enterIdentifierNumber', 'Enter identifier number')}
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
