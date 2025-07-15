import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';

export const saveOrUpdateLocation = async (locationPayload, locationUuid) => {
  if (typeof locationPayload === 'string' && typeof locationUuid === 'object') {
    const temp = locationPayload;
    locationPayload = locationUuid;
    locationUuid = temp;
  }

  const url = locationUuid ? `${restBaseUrl}/location/${locationUuid}` : `${restBaseUrl}/location`;
  return await openmrsFetch(url, {
    method: 'POST',
    body: locationPayload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
