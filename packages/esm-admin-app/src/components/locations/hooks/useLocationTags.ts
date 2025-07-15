import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type LocationTagsResponse } from '../types/index';

export const useLocationTags = () => {
  const customPresentation = 'custom:(uuid,display,name,description)';
  const url = `${restBaseUrl}/locationtag?v=${customPresentation}`;
  const { isLoading, error, data } = useSWR<FetchResponse<LocationTagsResponse>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    locationTagList: data?.data?.results || [],
  };
};
