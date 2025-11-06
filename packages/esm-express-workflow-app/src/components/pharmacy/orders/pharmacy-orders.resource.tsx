import { fhirBaseUrl, useFhirPagination } from '@openmrs/esm-framework';
import { useMemo, useState } from 'react';

interface MedicationRequestEntry {
  fullUrl: string;
  resource: fhir.MedicationRequest;
  search?: { mode: string };
}

type FhirResource = fhir.Encounter | fhir.MedicationRequest | fhir.MedicationDispense;

const isActiveMedicationRequest = (resource: FhirResource): resource is fhir.MedicationRequest => {
  return resource?.resourceType === 'MedicationRequest' && resource?.status === 'active';
};

const toMedicationRequestEntry = (resource: fhir.MedicationRequest): MedicationRequestEntry => ({
  fullUrl: `MedicationRequest/${resource.id}`,
  resource: resource,
});

export const usePharmacyOrders = (patientIdentifierOrName: string, searchTerm: string = '') => {
  const [currPageSize, setCurrPageSize] = useState(10);

  // Build URL with search parameters
  const searchParam = searchTerm ? `&medicationSearchTerm=${encodeURIComponent(searchTerm)}` : '';
  const url = patientIdentifierOrName
    ? `${fhirBaseUrl}/Encounter?_query=encountersWithMedicationRequests&patientSearchTerm=${encodeURIComponent(
        patientIdentifierOrName,
      )}&status=active${searchParam}&_summary=data&_getpagesoffset=0&_count=${currPageSize}`
    : null;

  // API returns an array of FHIR resources directly
  const { data, isLoading, error, paginated, currentPage, goTo, totalCount, currentPageSize, mutate } =
    useFhirPagination(url, currPageSize);

  const medicationRequests = useMemo((): MedicationRequestEntry[] => {
    if (!data) {
      return [];
    }

    // Filter resources by type and transform to bundle entry format for component compatibility
    const resources = Array.isArray(data) ? (data as FhirResource[]) : [];
    return resources.filter(isActiveMedicationRequest).map(toMedicationRequestEntry);
  }, [data]);

  return {
    medicationRequests,
    isLoading,
    error,
    mutate,
    paginated,
    currentPage,
    goTo,
    totalCount,
    currentPageSize,
    currPageSize,
    setCurrPageSize,
  };
};
