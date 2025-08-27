import { Button, ButtonSet, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './otp-verification.scss';
import PinPut from '../pin-put/pinput.component';

type OTPVerificationModalProps = {
  onClose?: () => void;
  otpLength?: number;
  onVerify?: (otp: string) => Promise<void>;
};

const OTPVerificationModal: FC<OTPVerificationModalProps> = ({ onClose, onVerify, otpLength = 5 }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleVerify = async () => {
    try {
      setIsLoading(true);
      await onVerify?.(otp);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <React.Fragment>
      <ModalHeader className={styles.sectionHeader} closeModal={onClose}>
        {t('otpVerification', 'OTP Verification')}
      </ModalHeader>
      <ModalBody>
        <div>
          <PinPut value={otp} onChange={setOtp} numInputs={otpLength} />
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={isLoading || otp.length !== otpLength}
            kind="primary"
            onClick={handleVerify}
            className={styles.button}>
            {t('verify', 'Verify')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default OTPVerificationModal;
