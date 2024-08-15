import React from 'react';
import { Package } from '../types';
import { generateOfflineUuid } from '@openmrs/esm-framework';

const usePackages = () => {
  return {
    isLoading: false,
    packages: [{ name: 'Package 1', uuid: generateOfflineUuid().split('+').at(-1) }] as Array<Package>,
    error: undefined,
  };
};

export default usePackages;
