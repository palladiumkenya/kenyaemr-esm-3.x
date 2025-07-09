import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type LocationResponse } from '../types';

type LocationsApiResponse = {
  results: LocationResponse[];
  links?: Array<{ rel: 'prev' | 'next'; uri: string }>;
  totalCount?: number;
};

/**
 * Fetches all locations from the server with the given custom presentation.
 * @param {string} customPresentation - The custom presentation to request.
 * @returns {Promise<LocationResponse[]>} - A promise that resolves with all the locations.
 */
const fetchAllLocations = async (customPresentation: string): Promise<LocationResponse[]> => {
  const pageSize = 100;
  let allLocations: LocationResponse[] = [];
  let startIndex = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${restBaseUrl}/location?v=${customPresentation}&limit=${pageSize}&startIndex=${startIndex}`;

    try {
      const response = await openmrsFetch<LocationsApiResponse>(url);
      const locations = response.data.results || [];

      allLocations = [...allLocations, ...locations];

      hasMore = locations.length === pageSize;
      startIndex += pageSize;
    } catch (error) {
      throw error;
    }
  }

  return allLocations;
};

export const useFacilityLocations = () => {
  const customPresentation =
    'custom:(uuid,display,name,description,stateProvince,country,countyDistrict,address5,address6,tags,attributes:(uuid,attributeType:(uuid,display),value))';

  const {
    data: allLocations,
    isLoading,
    error,
    mutate,
  } = useSWR<LocationResponse[]>(`locations-${customPresentation}`, () => fetchAllLocations(customPresentation), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    allLocations: allLocations || [],
    isLoading,
    mutate,
    error,
  };
};
