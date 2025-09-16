import React from 'react';
import { useTranslation } from 'react-i18next';
import OrdersTabs from '../../shared/orders/OrdersTabs';
import LabTable from './lab-table.component';

type LaboratoryTabsProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const LaboratoryTabs: React.FC<LaboratoryTabsProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const testOrderTypeUuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';
  return (
    <OrdersTabs
      patientUuid={patientUuid}
      patient={patient}
      basePath="laboratory"
      resultsSlotName="ewf-laboratory-results-slot"
      orderTypeUuid={testOrderTypeUuid}
      Table={({ orders }) => <LabTable orders={orders} />}
    />
  );
};

export default LaboratoryTabs;
