import { openmrsFetch, restBaseUrl, useConfig, useOpenmrsPagination } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import { ConfigObject } from '../config-schema';
import { PaginatedResponse } from '../types';
import { makeUrlUrl } from '../utils/utils';
export async function fetchDeceasedPatient(query: string, abortController: AbortController) {
  const customRepresentation =
    'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name)),person:(uuid,display,gender,birthdate,dead,age,deathDate,causeOfDeath:(uuid,display),preferredAddress:(uuid,stateProvince,countyDistrict,address4)))';
  const url = `${restBaseUrl}/morgue/patient?v=${customRepresentation}&dead=true&name=${query}`;

  const resp = await openmrsFetch<{ results: Array<PaginatedResponse> }>(url, {
    signal: abortController.signal,
  });
  return resp?.data?.results;
}
