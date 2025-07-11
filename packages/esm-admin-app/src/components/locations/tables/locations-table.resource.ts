import { FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { type FHIRBundle, FHIRLocation, LocationTagsResponse } from '../types';
import useSWR from 'swr';

/**
 * Fetches facilities that are tagged with any of the specified location tags.
 *
 * @param locationTags The location tags to filter facilities by
 * @returns A promise that resolves to the data object containing the matching FHIR locations
 * @throws {Error} If the API request fails
 */
export async function getFacilitiesByLocationTags(
  locationTags: LocationTagsResponse,
): Promise<{ results: Array<FHIRLocation> }> {
  const tagNames = locationTags.results
    .map((tag) => encodeURIComponent(tag.name || tag.display))
    .filter(Boolean)
    .join(',');

  const url = `${fhirBaseUrl}/Location?_summary=data&_tag=${tagNames}`;
  const response = await openmrsFetch<FHIRBundle>(url);

  const locations = response.data?.entry?.map((entry) => entry.resource) ?? [];

  return { results: locations };
}

export const useFacilitiesTagged = (locationTags: LocationTagsResponse) => {
  const tagNames = locationTags.results
    .map((tag) => encodeURIComponent(tag.name || tag.display))
    .filter(Boolean)
    .join(',');
  const url = `${fhirBaseUrl}/Location?_summary=data&_tag=${tagNames}`;
  const { isLoading, error, data } = useSWR<FetchResponse<FHIRBundle>>(url, openmrsFetch);

  return {
    isLoading,
    error,
    facilityList: data?.data?.entry || [],
  };
};
