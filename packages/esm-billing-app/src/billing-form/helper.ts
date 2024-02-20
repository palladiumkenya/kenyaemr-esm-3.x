import { uuidsMap } from '../constants';

export const hasPatientBeenExempted = (attributes: Array<any>, isPatientExempted: string): boolean =>
  attributes.find(({ attributeType }) => attributeType === isPatientExempted)?.value === uuidsMap.isExceptedUuid;
