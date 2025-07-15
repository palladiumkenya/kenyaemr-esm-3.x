import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';

export const saveOrUpdateLocation = async (locationPayload, locationUuid) => {
  const url = locationUuid ? `${restBaseUrl}/location/${locationUuid}` : `${restBaseUrl}/location`;
  return await openmrsFetch(url, {
    method: 'POST',
    body: locationPayload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
