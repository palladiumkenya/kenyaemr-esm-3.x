import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
// DELETE /provider/:target_provider_uuid?purge=true

export const disableLogin = (payload, providerUuid: string) => {
  const url = `${restBaseUrl}/provider/${providerUuid}`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
