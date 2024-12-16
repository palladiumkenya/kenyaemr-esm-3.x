import { FetchResponse, OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

// Define interfaces
export interface RoleCategory {
  category: string; // Name of the category (e.g., Admin Roles)
  roles: Array<string>; // List of role names
}

// Fetch and configure roles
export function useSystemUserRoleConfigSetting() {
  const { data, error, isLoading, mutate } = useSWRImmutable<{ data: { results: Array<OpenmrsResource> } }, Error>(
    `/ws/rest/v1/systemsetting?q=kenyaemr.userRole.config&v=full`,
    openmrsFetch,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // Extract user role config resource from the response
  const userRolesConfigResource = data?.data?.results?.find(
    (resource) => resource.property === 'kenyaemr.userRole.config',
  );

  // Parse roles into RoleCategory format
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
