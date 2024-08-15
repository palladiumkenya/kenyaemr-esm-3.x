import useSWR from 'swr';
import { FetchResponse, openmrsFetch, showToast } from '@openmrs/esm-framework';
import { Bed, AdmissionLocation, MappedBedData } from '../types';

export const useLocationsByTag = (locationUuid: string) => {
  const locationsUrl = `/ws/rest/v1/location?tag=Admission&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(
    locationUuid ? locationsUrl : null,
    openmrsFetch,
  );

  return {
    data: data?.data?.results ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const getBedsForLocation = (locationUuid: string) => {
  const locationsUrl = `/ws/rest/v1/bed?locationUuid=${locationUuid}`;

  return openmrsFetch(locationsUrl, {
    method: 'GET',
  }).then((res) => res?.data?.results ?? []);
};

export const useBedsForLocation = (locationUuid: string) => {
  const apiUrl = `/ws/rest/v1/bed?locationUuid=${locationUuid}&v=full`;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<Bed> } }, Error>(
    locationUuid ? apiUrl : null,
    openmrsFetch,
  );

  const mappedBedData: MappedBedData = (data?.data?.results ?? []).map((bed) => ({
    id: bed.id,
    number: bed.bedNumber,
    name: bed.bedType?.displayName,
    description: bed.bedType?.description,
    status: bed.status,
    uuid: bed.uuid,
  }));

  return {
    bedData: mappedBedData,
    isLoading,
    error,
  };
};

export const useLocationName = (locationUuid: string) => {
  const apiUrl = `/ws/rest/v1/location/${locationUuid}`;

  const { data, isLoading } = useSWR<{ data }, Error>(locationUuid ? apiUrl : null, openmrsFetch);

  return {
    name: data?.data?.display ?? null,
    isLoadingLocationData: isLoading,
  };
};

export const findBedByLocation = (locationUuid: string) => {
  const locationsUrl = `/ws/rest/v1/bed?locationUuid=${locationUuid}`;
  return openmrsFetch(locationsUrl, {
    method: 'GET',
  });
};

export const useWards = (locationUuid: string) => {
  const locationsUrl = `/ws/rest/v1/location?tag=${locationUuid}&v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(
    locationUuid ? locationsUrl : null,
    openmrsFetch,
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useAdmissionLocations = () => {
  const locationsUrl = `/ws/rest/v1/admissionLocation?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data: { results: Array<AdmissionLocation> } },
    Error
  >(locationsUrl, openmrsFetch);

  return {
    data: data?.data?.results ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useAdmissionLocationBedLayout = (locationUuid: string) => {
  const locationsUrl = `/ws/rest/v1/admissionLocation/${locationUuid}?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: AdmissionLocation }, Error>(
    locationsUrl,
    openmrsFetch,
  );

  return {
    data: data?.data?.bedLayouts ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};
export const useBedType = () => {
  const url = `/ws/rest/v1/bedtype/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];
  return {
    bedTypeData: results,
    isError: error,
    loading: isLoading,
    validate: isValidating,
    mutate,
  };
};

export const useBedTag = () => {
  const url = `/ws/rest/v1/bedTag/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];
  return {
    bedTypeData: results,
    isError: error,
    loading: isLoading,
    validate: isValidating,
    mutate,
  };
};
interface BedType {
  name: string;
  displayName: string;
  description: string;
}
interface BedTag {
  name: string;
}
export async function saveBedType({ bedPayload }): Promise<FetchResponse<BedType>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedtype`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bedPayload,
    });
    return response;
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on saving form',
      kind: 'error',
      critical: true,
    });
  }
}

interface WardName {
  name: string;
}
export async function saveBedTag({ bedPayload }): Promise<FetchResponse<WardName>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedTag/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bedPayload,
    });
    return response;
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on saving form',
      kind: 'error',
      critical: true,
    });
  }
}
export async function editBedType({ bedPayload, bedTypeId }): Promise<FetchResponse<BedType>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedtype/${bedTypeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bedPayload,
    });
    return response;
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on saving form',
      kind: 'error',
      critical: true,
    });
  }
}
export async function editBedTag({ bedPayload, bedTagId }): Promise<FetchResponse<BedType>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedTag/${bedTagId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bedPayload,
    });
    return response;
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on saving form',
      kind: 'error',
      critical: true,
    });
  }
}

export function extractErrorMessagesFromResponse(errorObject) {
  const fieldErrors = errorObject?.responseBody?.error?.fieldErrors;

  if (!fieldErrors) {
    return [errorObject?.responseBody?.error?.message ?? errorObject?.message];
  }

  return Object.values(fieldErrors).flatMap((errors: Array<Error>) => errors.map((error) => error.message));
}

export async function deleteBedTag(bedTagId: string): Promise<FetchResponse<BedTag>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedTag/${bedTagId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return response;
    } else {
      throw new Error(`Failed to delete bed tag. Status: ${response.status}`);
    }
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on deleting bed tag',
      kind: 'error',
      critical: true,
    });
  }
}

export async function deleteBedType(bedtype: string): Promise<FetchResponse<BedType>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedtype/${bedtype}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return response;
    } else {
      throw new Error(`Failed to delete bed tag. Status: ${response.status}`);
    }
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on saving form',
      kind: 'error',
      critical: true,
    });
  }
}

export const useWard = () => {
  const url = `ws/rest/v1/location/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];

  return {
    wardList: results,
    isError: error,
    loading: isLoading,
    validate: isValidating,
    mutate,
  };
};
export const useLocationTags = () => {
  const url = `ws/rest/v1/locationtag`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];

  return {
    tagList: results,
    tagError: error,
    tagLoading: isLoading,
    tagValidate: isValidating,
    tagMutate: mutate,
  };
};

export async function saveWard({ wardPayload }): Promise<FetchResponse<BedTag>> {
  try {
    const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/location/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: wardPayload,
    });
    return response;
  } catch (error) {
    const errorMessages = extractErrorMessagesFromResponse(error);
    showToast({
      description: errorMessages.join(', '),
      title: 'Error on saving form',
      kind: 'error',
      critical: true,
    });
  }
}
