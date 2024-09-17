import React, { useMemo } from 'react';
import { diagnoses as _diagnoses } from '../benefits-package/benefits-package.mock';

const usePatientDiagnosis = (patientUUid: string) => {
  const diagnoses_ = useMemo(() => _diagnoses, []);
  return {
    isLoading: false,
    error: undefined,
    diagnoses: diagnoses_,
  };
};

export default usePatientDiagnosis;
