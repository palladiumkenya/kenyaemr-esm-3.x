import { type RadiologyOrderBasketItem } from '../../../types';
import { type RadiologyType } from './useRadiologyTypes';

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
export const priorityOptions = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
  { value: 'ON_SCHEDULED_DATE', label: 'Scheduled' },
];
// TODO add priority option `{ value: "ON_SCHEDULED_DATE", label: "On scheduled date" }` once the form supports a date.

export function createEmptyLabOrder(testType: RadiologyType, orderer: string): RadiologyOrderBasketItem {
  return {
    action: 'NEW',
    display: testType.label,
    testType,
    orderer,
  };
}
