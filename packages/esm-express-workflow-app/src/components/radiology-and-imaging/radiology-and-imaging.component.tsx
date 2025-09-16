import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import OrdersTabs from '../../shared/orders/OrdersTabs';
import LabTable from './radiology-and-imaging-table.component';
import { ExpressWorkflowConfig } from '../../config-schema';

type RadiologyAndImagingTabsProps = {
  patientUuid: string;
  patient: fhir.Patient;
};
const imagingRadiologyConceptClassUuid = '8caa332c-efe4-4025-8b18-3398328e1323';

const RadiologyAndImagingTabs: React.FC<RadiologyAndImagingTabsProps> = ({ patientUuid, patient }) => {
  const { imagingOrderTypeUuid } = useConfig<ExpressWorkflowConfig>();
  return (
    <OrdersTabs
      patientUuid={patientUuid}
      patient={patient}
      basePath="radiology-and-imaging"
      resultsSlotName="ewf-radiology-and-imaging-results-slot"
      orderTypeUuid={imagingOrderTypeUuid}
      filter={(order) => order.concept?.conceptClass?.uuid === imagingRadiologyConceptClassUuid}
      Table={({ orders }) => <LabTable orders={orders} />}
    />
  );
};

export default RadiologyAndImagingTabs;
