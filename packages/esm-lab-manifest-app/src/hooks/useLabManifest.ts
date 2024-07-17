import React from 'react';
import { labManifest } from '../lab-manifest.mock';

const useLabManifest = (status: string) => {
  return {
    isLoading: false,
    manifests: labManifest,
    error: undefined,
  };
};

export default useLabManifest;
