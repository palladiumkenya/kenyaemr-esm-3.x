import useSWR from 'swr';

const mpiBaseUrl = 'https://hiedhs.intellisoftkenya.com/Patient';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type MPISearchResponse = fhir.Resource & {
  entry: Array<{
    resource: fhir.Patient;
  }>;
};

export const useMPISearch = (patientIdentifier: string) => {
  const { data, error, isLoading } = useSWR<MPISearchResponse>(
    patientIdentifier ? `${mpiBaseUrl}/${patientIdentifier}` : null,
    fetcher,
  );
  const patients = data?.entry?.map((entry) => entry.resource) ?? [];

  return { patients, error, isLoading };
};
