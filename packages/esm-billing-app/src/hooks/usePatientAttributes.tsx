import { openmrsFetch, OpenmrsResource, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

interface PatientAttributes extends OpenmrsResource {
  attributeType: OpenmrsResource;
  value: string;
}

/**
 * Custom hook to fetch and retrieve patient attributes for a given patient UUID.
 *
 * @param patientUuid - The UUID of the patient.
 * @returns An object containing the patient's phone number, loading state, and error state.
 */
export const usePatientAttributes = (patientUuid: string) => {
  const config = useConfig({ externalModuleName: '@kenyaemr/esm-patient-registration-app' });
  const { data, isLoading, error } = useSWRImmutable<{ data: { person: { attributes: Array<PatientAttributes> } } }>(
    `${restBaseUrl}/patient/${patientUuid}?v=custom:(person:(attributes:(uuid,display,value,attributeType:(uuid,name)))`,
    openmrsFetch,
  );
  const patientPhoneAttribute = data?.data?.person?.attributes.find(
    (attr) => attr.attributeType.uuid === config?.fieldConfigurations?.phone?.personAttributeUuid,
  )?.value;

  return { phoneNumber: patientPhoneAttribute, isLoading, error };
};
