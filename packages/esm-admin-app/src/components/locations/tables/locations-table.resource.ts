import { useFhirFetchAll } from '@openmrs/esm-framework';
import { type FHIRLocation, type LocationTagsResponse } from '../types';

/**
 * Custom hook that fetches all facilities with specified location tags.
 * Uses the framework's useFhirFetchAll hook which handles pagination automatically.
 *
 * @param locationTags The location tags response containing tags to filter by
 * @returns Object containing loading state, error, and the list of facilities
 */
export const useFacilitiesTagged = (locationTags: LocationTagsResponse) => {
  const tagNames = locationTags?.results
    ?.map((tag) => encodeURIComponent(tag.name || tag.display))
    .filter(Boolean)
    .join(',');

  const url = tagNames ? `ws/fhir2/R4/Location?_summary=data&_tag=${tagNames}` : null;

  const { data, isLoading, error } = useFhirFetchAll<FHIRLocation>(url);

  return {
    isLoading,
    error,
    facilityList: data?.map((resource) => ({ resource })) || [],
  };
};
