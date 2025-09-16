import React from 'react';
import { useConfig } from '@openmrs/esm-framework';

import OrdersTabs from '../../shared/orders/OrdersTabs';
import LabTable from './procedures-table.component';
import { ExpressWorkflowConfig } from '../../config-schema';

type ProceduresTabsProps = {
  patientUuid: string;
  patient: fhir.Patient;
};
const proceduresConceptClassUuid = '8d490bf4-c2cc-11de-8d13-0010c6dffd0f';

const ProceduresTabs: React.FC<ProceduresTabsProps> = ({ patientUuid, patient }) => {
  const { imagingOrderTypeUuid } = useConfig<ExpressWorkflowConfig>();
  return (
    <OrdersTabs
      patientUuid={patientUuid}
      patient={patient}
      basePath="procedures"
      resultsSlotName="ewf-radiology-and-imaging-results-slot"
      orderTypeUuid={imagingOrderTypeUuid}
      filter={(order) => order.concept?.conceptClass?.uuid === proceduresConceptClassUuid}
      Table={({ orders }) => <LabTable orders={orders} />}
    />
  );
};

export default ProceduresTabs;
