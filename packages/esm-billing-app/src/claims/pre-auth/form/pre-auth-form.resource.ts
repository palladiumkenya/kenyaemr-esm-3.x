import { useMemo } from 'react';
import { interventions, packages } from './pre-auth-mock-data';

export const useInterventions = () => {
  const _interventions = useMemo(() => interventions, []);
  return {
    isLoading: false,
    interventions: _interventions,
    error: undefined,
  };
};

export const usePackages = () => {
  const _packages = useMemo(() => packages, []);
  return {
    isLoading: false,
    packages: _packages,
    error: undefined,
  };
};
