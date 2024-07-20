import React from 'react';
import { activeRequests } from '../lab-manifest.mock';

const useActiveRequests = () => {
  return {
    isLoading: false,
    requests: activeRequests,
    error: undefined,
  };
};

export default useActiveRequests;
