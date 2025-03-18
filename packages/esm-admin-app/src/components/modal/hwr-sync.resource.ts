import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export const createProviderAttribute = (payload, providerUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}/attribute`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateProviderAttributes = (payload, providerUuid: string, attributeUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}/attribute/${attributeUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
