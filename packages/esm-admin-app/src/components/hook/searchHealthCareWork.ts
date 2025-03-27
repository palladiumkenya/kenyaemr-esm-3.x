import { FetchResponse, makeUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { HWR_API_NO_CREDENTIALS, PROVIDER_NOT_FOUND, RESOURCE_NOT_FOUND, UNKNOWN } from '../../constants';
import useSWR from 'swr';
import { useState } from 'react';

export const searchHealthCareWork = async (identifierType: string, identifierNumber: string) => {
  const url = `${restBaseUrl}/kenyaemr/practitionersearch?identifierType=${identifierType}&identifierNumber=${identifierNumber}`;
  const response = await fetch(makeUrl(url));
  if (response.ok) {
    const responseData = await response.json();
    if (responseData?.issue) {
      throw new Error(PROVIDER_NOT_FOUND);
    }
    return responseData;
  }
  if (response.status === 401) {
    throw new Error(HWR_API_NO_CREDENTIALS);
  } else if (response.status === 404) {
    throw new Error(RESOURCE_NOT_FOUND);
  }
  throw new Error(UNKNOWN);
};
