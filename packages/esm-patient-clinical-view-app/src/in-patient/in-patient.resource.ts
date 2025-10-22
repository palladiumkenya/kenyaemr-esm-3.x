import { useState, useEffect } from 'react';

// Minimal hook stub to provide admission request data for the admission-request.component
export const useAdmissionRequest = (patientUuid: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [admissionRequest, setAdmissionRequest] = useState<any[]>([]);

  useEffect(() => {
    // noop: leave empty so consumers can render skeletons until real implementation is wired
    setIsLoading(false);
  }, [patientUuid]);

  const mutate = () => Promise.resolve();

  return { admissionRequest, isLoading, error, mutate };
};
