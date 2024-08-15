import React from 'react';
import { Package } from '../types';
import { generateOfflineUuid } from '@openmrs/esm-framework';

const usePackages = () => {
  return {
    isLoading: false,
    packages: [
      {
        shaPackageName: 'Package 1',
        uuid: generateOfflineUuid().split('+').at(-1),
        packageAccessPoint: 'IP',
        shaPackageCode: '',
      },
      {
        shaPackageName: 'Package 2',
        uuid: generateOfflineUuid().split('+').at(-1),
        packageAccessPoint: 'IP',
        shaPackageCode: '',
      },
    ] as Array<Package>,
    error: undefined,
  };
};

export default usePackages;
