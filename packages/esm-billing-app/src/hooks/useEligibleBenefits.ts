import { useMemo } from 'react';
import { coverageEligibilityResponse } from '../benefits-package/benefits-package.mock';
import { CoverageEligibilityResponse, InsurersBenefits } from '../types';

const useEligibleBenefits = (patientUuid: string) => {
  const benefits = useMemo(() => {
    const benefits = coverageEligibilityResponse as Array<CoverageEligibilityResponse>;
    const insurerBenefits = benefits.reduce<Array<InsurersBenefits>>(
      (prev, curr) => [...prev, ...curr.benefits.map((b) => ({ ...b, insurer: curr.insurer }))],
      [],
    );
    return insurerBenefits;
  }, []);
  return {
    isLoading: false,
    benefits,
    error: undefined,
  };
};

export default useEligibleBenefits;
