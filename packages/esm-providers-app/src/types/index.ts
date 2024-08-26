import { OpenmrsAppRoutes, OpenmrsResource } from '@openmrs/esm-framework';
import { createStore } from 'zustand/vanilla';

export type Provider = {
  id: any;
  uuid: string;
  identifier: string;
  display: string;
  person: OpenmrsResource;
  attributes?: Array<OpenmrsResource> | null;
  retired: boolean;
};

export type ProviderSession = {
  authenticated: boolean;
  user: any;
  currentProvider: any;
  sessionLocation: any;
};
