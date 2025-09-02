import { useEffect } from 'react';
import { setCurrentVisit } from '@openmrs/esm-framework';
import { getPatientChartStore } from '@openmrs/esm-patient-common-lib';

type PatientState = {
  patient: any;
  patientUuid?: string;
};

export const useInitialize = (patientUuid: string | undefined, state: PatientState) => {
  useEffect(() => {
    setCurrentVisit(patientUuid, null);
    return () => {
      setCurrentVisit(null, null);
    };
  }, [patientUuid]);

  useEffect(() => {
    getPatientChartStore().setState({ ...state });
    return () => {
      getPatientChartStore().setState({});
    };
  }, [state]);
};
