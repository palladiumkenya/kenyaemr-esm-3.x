import React from 'react';
import AdmissionRequest from './admission-request.component';

type InPatientProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const InPatient: React.FC<InPatientProps> = ({ patientUuid }) => {
  return <AdmissionRequest patientUuid={patientUuid} />;
};

export default InPatient;
