import { restBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const saveLocation = async (locationPayload) => {
  const url = `${restBaseUrl}/location`;
  return await openmrsFetch(url, {
    method: 'POST',
    body: locationPayload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const editLocation = async (locationUuid, locationPayload) => {
  const url = `${restBaseUrl}/location/${locationUuid}`;
  return await openmrsFetch(url, {
    method: 'POST',
    body: locationPayload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
