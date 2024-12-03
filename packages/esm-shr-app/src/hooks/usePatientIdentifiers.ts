import { usePatient } from '@openmrs/esm-framework';

const usePatientIdentifiers = (uuid: string) => {
  const { isLoading, error, patient } = usePatient(uuid);

  return {
    isLoading,
    error,
    hasType: (typeUuid: string) =>
      patient?.identifier.findIndex((identifer) => identifer.type.coding[0]?.code === typeUuid) !== -1,
  };
};

export default usePatientIdentifiers;
