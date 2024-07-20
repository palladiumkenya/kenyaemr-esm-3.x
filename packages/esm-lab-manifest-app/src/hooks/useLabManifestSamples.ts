import React from 'react';
import { labManifestSamples } from '../lab-manifest.mock';

const useLabManifestSamples = (manifestUuid: string) => {
  return {
    isLoading: false,
    samples: labManifestSamples,
    error: undefined,
  };
};

export default useLabManifestSamples;
