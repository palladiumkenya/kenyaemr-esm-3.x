// import useSWR from 'swr';
// import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
// import { Provider } from '../types';

// const providerUrl = `${restBaseUrl}/provider`;
// export const custom = `?v=custom:(uuid,identifier,display,person:(uuid,display),attributes:(uuid,display),retired)`;

// export const UseAllProviders = () => {
//   const { data, isLoading, error, isValidating } = useSWR<{ data: { results: Array<Provider> } }>(
//     `${providerUrl}${custom}`,
//     openmrsFetch,
//   );

//   return {
//     providers: data?.data.results ?? [],
//     isLoading,
//     error,
//     isValidating,
//   };
// };

// export const searchUsers = async (name: string, ac = new AbortController()) => {
//   const results = await openmrsFetch(`${restBaseUrl}/user?q=${name}&v=custom:(uuid,display,person)`, {
//     signal: ac.signal,
//   });
//   return results.data.results;
// };
