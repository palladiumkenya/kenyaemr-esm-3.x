import React, { useCallback } from 'react';
import { Button } from '@carbon/react';

import { useTranslation } from 'react-i18next';
import { navigate, showModal, showSnackbar } from '@openmrs/esm-framework';
import { ReferralReasonsProps } from '../types';
import { processCommunityReferral } from './refferals.resource';

interface ReferralReasonData {
  referralData: ReferralReasonsProps;
  status: string;
}

const CommunityReferralActions: React.FC<ReferralReasonData> = ({ status, referralData }) => {
  const { t } = useTranslation();

  const handleProcessReferral = useCallback(() => {
    processCommunityReferral(referralData.messageId)
      .then((res) => {
        showSnackbar({
          title: t('processReferral', 'Process referral'),
          subtitle: t('processReferralSuccess', 'Patient registered successfully'),
          kind: 'success',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
        navigate({
          to: window.getOpenmrsSpaBase() + `patient/${res.data?.uuid}/chart/Patient Summary`,
        });
      })
      .catch((err) => {
        showSnackbar({
          title: t('processReferral', 'Process referral'),
          subtitle: t('processReferralError', 'Process referral error', { error: err.message }),
          kind: 'error',
          timeoutInMs: 3500,
          isLowContrast: true,
        });
      });
  }, [referralData, t]);

  const refearralReasonsHandleClick = useCallback(() => {
    const dispose = showModal('referral-reasons-dialog', {
      closeModal: () => dispose(),
      referralReasons: referralData,
      status: status,
      handleProcessReferral,
    });
  }, [referralData, handleProcessReferral, status]);

  return (
    <>
      <Button kind="primary" size="md" style={{ 'margin-right': '10px' }} onClick={() => refearralReasonsHandleClick()}>
        View reasons
      </Button>
      {status === 'completed' ? null : (
        <Button kind="primary" size="md" onClick={() => handleProcessReferral()}>
          Serve client
        </Button>
      )}
    </>
  );
};
export default CommunityReferralActions;
