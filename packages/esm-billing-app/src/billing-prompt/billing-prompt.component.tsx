import React, { useEffect } from 'react';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import { useBillingPrompt } from './billing-prompt.resource';
import { navigate, showModal } from '@openmrs/esm-framework';

const BillingPrompt: React.FC = () => {
  const patientUuid = getPatientUuidFromUrl();
  const { shouldShowBillingPrompt, isLoading, currentVisit } = useBillingPrompt(patientUuid);

  useEffect(() => {
    if (shouldShowBillingPrompt) {
      let dispose: () => void;

      const handleModalActions = () => {
        if (dispose) {
          dispose();
        }
        navigate({ to: `\${openmrsSpaBase}/home` });
      };

      if (!isLoading && shouldShowBillingPrompt) {
        dispose = showModal('require-billing-modal', {
          cancel: handleModalActions,
          closeModal: () => dispose(),
          patientUuid,
        });
      }

      return () => {
        if (dispose) {
          dispose();
        }
      };
    }
  }, [isLoading, shouldShowBillingPrompt, patientUuid, currentVisit?.visitType?.uuid]);

  return null;
};

export default BillingPrompt;
