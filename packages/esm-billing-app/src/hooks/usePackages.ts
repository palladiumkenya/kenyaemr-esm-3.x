import React, { useMemo } from 'react';
import { Package } from '../types';
import { generateOfflineUuid } from '@openmrs/esm-framework';
import { packages } from '../benefits-package/benefits-package.mock';

const usePackages = () => {
  const _package = useMemo(() => packages, []);

  return {
    isLoading: false,
    packages: _package as Array<Package>,
    error: undefined,
  };
};

export default usePackages;
