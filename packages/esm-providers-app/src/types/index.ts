import { OpenmrsResource } from '@openmrs/esm-framework';

export type Provider = {
  id: any;
  uuid: string;
  identifier: string;
  display: string;
  person: OpenmrsResource;
  attributes?: Array<OpenmrsResource> | null;
  retired: boolean;
};
