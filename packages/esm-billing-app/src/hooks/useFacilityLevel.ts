import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface SHAFacilityStatus {
  operationalStatus: string;
  approved: string;
  kephLevel: string;
  shaFacilityId: string;
  shaFacilityExpiryDate: string;
  registrationNumber: string;
  mflCode: string;
  shaFacilityLicenseNumber: string;
  facilityRegistryCode: string;
  source: string;
}

const useFacilityLevel = () => {
  const url = `${restBaseUrl}/kenyaemr/sha-facility-status?synchronize=false`;
  const { data, isLoading, error } = useSWR<FetchResponse<SHAFacilityStatus>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    level: data?.data?.kephLevel,
  };
};

export default useFacilityLevel;
