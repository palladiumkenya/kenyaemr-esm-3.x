import React, { useMemo } from 'react';
import { intervensions, patientBenefits } from '../benefits-package/benefits-package.mock';

const useInterventions = () => {
  const _int = useMemo(() => intervensions, [patientBenefits]);
  return {
    isLoading: false,
    interventions: intervensions,
    error: undefined,
  };
};

export default useInterventions;
