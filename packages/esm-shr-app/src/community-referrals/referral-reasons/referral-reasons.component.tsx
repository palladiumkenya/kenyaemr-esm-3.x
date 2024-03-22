import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, FileUploader } from '@carbon/react';
import { ReferralReasonsProps } from '../../types';
import styles from './referral-reasons.component.scss';
import { showNotification } from '@openmrs/esm-framework';
// import { showNotification, showToast } from '@openmrs/esm-framework';

export interface ReferralReasonsDialogPopupProps {
  closeModal: () => void;
  referralReasons: ReferralReasonsProps;
  status: string;
  handleProcessReferral: () => void;
}

const ReferralReasonsDialogPopup: React.FC<ReferralReasonsDialogPopupProps> = ({
  closeModal,
  referralReasons,
  status,
  handleProcessReferral,
}) => {
  const { t } = useTranslation();

  const handleServeClient = async () => {
    try {
      await handleProcessReferral();
      closeModal();
    } catch (error) {
      showNotification({
        title: t('referralError', 'Error processing referral'),
        kind: 'error',
        critical: true,
        description: 'Error processing referral',
      });
    }
  };

  return (
    <div>
      <Form>
        <ModalHeader closeModal={closeModal} title={t('referralReasons', 'Referral Reasons')} />
        <ModalBody className={styles.modalBody}>
          <div className={styles.reasonCode}>
            <span>{t('reasonCode', 'Reason Code')} : </span>
            {referralReasons.reasonCode}
          </div>
          <div className={styles.clinicalNote}>
            <span>{t('clinicalNote', 'Clinical Note')} : </span>
            {referralReasons.clinicalNote}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          {status === 'completed' ? null : (
            <Button kind="primary" onClick={handleServeClient}>
              {t('serveClient', 'Serve client')}
            </Button>
          )}
        </ModalFooter>
      </Form>
    </div>
  );
};

export default ReferralReasonsDialogPopup;
