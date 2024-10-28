import { makeUrl } from '@openmrs/esm-framework';

export function makeUrlUrl(path: string) {
  return new URL(makeUrl(path), window.location.toString());
}
