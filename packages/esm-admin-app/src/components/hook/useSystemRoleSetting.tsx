import { OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export interface RoleCategory {
  category: string;
  roles: Array<string>;
}

export function useSystemUserRoleConfigSetting() {
  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }, Error>(
    `/ws/rest/v1/systemsetting?q=kenyaemr.userRole.config&v=custom:(uuid,value,property)`,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const userRolesConfigResource = data?.data?.results?.find(
    (resource) => resource.property === 'kenyaemr.userRole.config',
  );

  let rolesConfig: RoleCategory[] = [];
  if (userRolesConfigResource?.value) {
    try {
      rolesConfig = JSON.parse(userRolesConfigResource.value) as RoleCategory[];
    } catch (error) {
      console.error('Error parsing roles configuration:', error);
    }
  }

  return { rolesConfig, isLoading, mutate, error };
}
