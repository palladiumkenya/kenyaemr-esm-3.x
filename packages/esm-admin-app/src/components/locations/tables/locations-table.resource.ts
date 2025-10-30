import { FetchResponse, fhirBaseUrl, openmrsFetch, useFhirFetchAll } from '@openmrs/esm-framework';
import { type FHIRBundle, FHIRLocation, LocationTagsResponse } from '../types';
import useSWR from 'swr';

/**
 * Converts an absolute URL to a relative path for openmrsFetch
 * Removes the /openmrs prefix if present since openmrsFetch adds it automatically
 */
function toRelativeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname + urlObj.search;

    if (path.startsWith('/openmrs/')) {
      path = path.substring(8);
    }

    return path;
  } catch {
    return url;
  }
}

/**
 * Recursively fetches all pages of locations from a paginated FHIR API.
 */
async function fetchAllPages(url: string, accumulatedLocations: FHIRLocation[] = []): Promise<FHIRLocation[]> {
  const relativeUrl = toRelativeUrl(url);

  const response = await openmrsFetch<FHIRBundle>(relativeUrl);

  const entries = response.data?.entry?.map((entry) => entry.resource) ?? [];
  const allLocations = [...accumulatedLocations, ...entries];

  const nextLink = response.data?.link?.find((link) => link.relation === 'next');

  if (nextLink?.url) {
    return fetchAllPages(nextLink.url, allLocations);
  }

  return allLocations;
}

/**
 * Fetches facilities that are tagged with any of the specified location tags.
 * Handles pagination automatically to fetch all results.
 *
 * @param locationTags The location tags to filter facilities by
 * @returns A promise that resolves to the data object containing all matching FHIR locations
 * @throws {Error} If the API request fails
 */
export async function getFacilitiesByLocationTags(
  locationTags: LocationTagsResponse,
): Promise<{ results: Array<FHIRLocation> }> {
  const tagNames = locationTags.results
    .map((tag) => encodeURIComponent(tag.name || tag.display))
    .filter(Boolean)
    .join(',');

  const url = `${useFhirFetchAll}/Location?_summary=data&_tag=${tagNames}`;

  const locations = await fetchAllPages(url);

  return { results: locations };
}

/**
 * Custom hook that fetches all facilities with specified location tags.
 * Handles pagination automatically and returns all results.
 */
export const useFacilitiesTagged = (locationTags: LocationTagsResponse) => {
  const tagNames = locationTags.results
    .map((tag) => encodeURIComponent(tag.name || tag.display))
    .filter(Boolean)
    .join(',');

  const url = `${fhirBaseUrl}/Location?_summary=data&_tag=${tagNames}`;

  const fetcher = async (url: string): Promise<FHIRLocation[]> => {
    const result = await fetchAllPages(url);
    return result;
  };

  const { isLoading, error, data } = useSWR<FHIRLocation[]>(url, fetcher);

  return {
    isLoading,
    error,
    facilityList: data?.map((resource) => ({ resource })) || [],
  };
};
