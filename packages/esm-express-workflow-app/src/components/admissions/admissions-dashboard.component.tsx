import React, { useMemo } from 'react';
import { Layer } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';

type AdmissionsDashboardProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const AdmissionsDashboard: React.FC<AdmissionsDashboardProps> = ({ patientUuid, patient }) => {
  const state = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);

  return (
    <Layer>
      <ExtensionSlot name="ewf-admissions-dashboard-slot" state={state} />
    </Layer>
  );
};

export default AdmissionsDashboard;
