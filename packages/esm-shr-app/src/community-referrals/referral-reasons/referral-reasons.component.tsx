import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, FileUploader } from '@carbon/react';
import { ReferralReasonsProps } from '../../types';
// import { showNotification, showToast } from '@openmrs/esm-framework';

export interface ReferralReasonsDialogPopupProps {
  closeModal: () => void;
  referralReasons: ReferralReasonsProps;
}

const ReferralReasonsDialogPopup: React.FC<ReferralReasonsDialogPopupProps> = ({ closeModal, referralReasons }) => {
  const { t } = useTranslation();

  return (
    <div>
      <Form>
        <ModalHeader closeModal={closeModal} title={t('referralReasons', 'Referral Reasons')} />
        <ModalBody>
          <h4>{referralReasons.reasonCode}</h4>
          <h4>{referralReasons.clinicalNote}</h4>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default ReferralReasonsDialogPopup;
