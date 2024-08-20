import { FetchResponse, openmrsFetch, Patient, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ReferralConfigObject } from '../config-schema';

function extractValue(display: string) {
  const pattern = /=\s*(.*)$/;
  const match = display.match(pattern);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return display.trim();
}

const usePatient = (uuid: string) => {
  const customPresentation =
    'custom:(uuid,display,identifiers,person:(uuid,display,attributes:(uuid,display,attributeType:(uuid,display))))';
  const url = `${restBaseUrl}/patient/${uuid}?v=${customPresentation}`;
  const { phoneNumberAttributeType } = useConfig<ReferralConfigObject>();
  const { data, error, isLoading } = useSWR<FetchResponse<Patient>>(url, openmrsFetch);
  return {
    isLoading,
    error,
    patient: data?.data,
    patientName: data?.data?.person.display,
    patientPhoneNumber: data?.data?.person?.attributes?.find(
      (attr) => attr.attributeType.uuid === phoneNumberAttributeType,
    )?.display
      ? extractValue(
          data?.data?.person?.attributes?.find((attr) => attr.attributeType.uuid === phoneNumberAttributeType)?.display,
        )
      : undefined,
  };
};

export default usePatient;
