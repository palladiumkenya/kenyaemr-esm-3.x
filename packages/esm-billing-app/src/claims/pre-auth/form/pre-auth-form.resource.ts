import { useMemo } from 'react';
import { mockInterventions, mockPackages } from './pre-auth-mock-data';

export const useInterventions = () => {
  const interventions = useMemo(() => mockInterventions, []);
  return {
    isLoading: false,
    interventions: interventions,
    error: undefined,
  };
};

export const usePackages = () => {
  const packages = useMemo(() => mockPackages, []);
  return {
    isLoading: false,
    packages: packages,
    error: undefined,
  };
};
