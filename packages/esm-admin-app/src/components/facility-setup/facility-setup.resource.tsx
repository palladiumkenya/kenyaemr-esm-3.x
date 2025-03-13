import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export const syncPackagesAndInterventions = async () => {
  const packagesSyncURL = `${restBaseUrl}/kenyaemr/sha-benefits-package?synchronize=true`;
  const intervesionSyncUrl = `${restBaseUrl}/kenyaemr/sha-interventions?synchronize=true`;
  await Promise.all([packagesSyncURL, intervesionSyncUrl].map((url) => openmrsFetch(url)));
};
