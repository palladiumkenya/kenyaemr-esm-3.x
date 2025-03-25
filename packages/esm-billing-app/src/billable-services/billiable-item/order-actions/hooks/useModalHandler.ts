import { launchWorkspace } from '@openmrs/esm-framework';
import { Order } from '@openmrs/esm-patient-common-lib';
import { useCallback } from 'react';
import { mutate } from 'swr';

export function useModalHandler(mutateUrl?: string) {
  const handleModalClose = useCallback(() => {
    if (!mutateUrl) {
      return;
    }

    mutate((key) => typeof key === 'string' && key.startsWith(mutateUrl), undefined, {
      revalidate: true,
    });
  }, [mutateUrl]);

  return {
    handleModalClose,
  };
}

export const launchPrescriptionEditWorkspace = (order: Order, patientUuid: string) => {
  const newItem = {
    uuid: order.uuid,
    display: order.drug?.display,
    previousOrder: order.uuid,
    startDate: new Date(),
    action: 'REVISE',
    drug: order.drug,
    dosage: order.dose,
    unit: {
      value: order.doseUnits?.display,
      valueCoded: order.doseUnits?.uuid,
    },
    frequency: {
      valueCoded: order.frequency?.uuid,
      value: order.frequency?.display,
    },
    route: {
      valueCoded: order.route?.uuid,
      value: order.route?.display,
    },
    commonMedicationName: order.drug?.display,
    isFreeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions',
    freeTextDosage: order.dosingType === 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    patientInstructions: order.dosingType !== 'org.openmrs.FreeTextDosingInstructions' ? order.dosingInstructions : '',
    asNeeded: order.asNeeded,
    asNeededCondition: order.asNeededCondition,
    duration: order.duration,
    durationUnit: {
      valueCoded: order.durationUnits?.uuid,
      value: order.durationUnits?.display,
    },
    pillsDispensed: order.quantity,
    numRefills: order.numRefills,
    indication: order.orderReasonNonCoded,
    orderer: order.orderer?.uuid,
    careSetting: order.careSetting?.uuid,
    quantityUnits: {
      value: order.quantityUnits?.display,
      valueCoded: order.quantityUnits?.uuid,
    },
  };

  launchWorkspace('add-drug-order', { patientUuid, order: newItem });
};
