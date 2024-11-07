import { makeUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export function makeUrlUrl(path: string) {
  return new URL(makeUrl(path), window.location.toString());
}
