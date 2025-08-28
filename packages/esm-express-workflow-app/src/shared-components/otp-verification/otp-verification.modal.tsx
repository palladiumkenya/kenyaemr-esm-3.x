import {
  Button,
  ButtonSet,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tabs,
  TextInput,
  Tile,
} from '@carbon/react';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './otp-verification.scss';
import PinPut from '../pin-put/pinput.component';
import { Phone } from '@carbon/react/icons';
export const PHONE_NUMBER_REGEX = /^(\+?254|0)((7|1)\d{8})$/;

type OTPVerificationModalProps = {
  onClose?: () => void;
  otpLength?: number;
  onVerify?: (otp: string) => Promise<void>;
  onVerificationSuccess?: () => void;
  obsecureText?: boolean;
  centerBoxes?: boolean;
  phoneNumber: string;
  renderOtpTrigger: (phoneNumber: string) => React.ReactNode;
  onRequestOtp?: (phoneNumber: string) => Promise<void>;
};

const OTPVerificationModal: FC<OTPVerificationModalProps> = ({
  onClose,
  onVerify,
  otpLength = 5,
  centerBoxes,
  obsecureText,
  phoneNumber,
  renderOtpTrigger,
  onRequestOtp,
  onVerificationSuccess,
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ type: 'request' | 'verification'; error: Error } | null>(null);
  const [mode, setMode] = useState<'landing' | 'verify-otp' | 'change-number'>('landing');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const handleVerify = async () => {
    setError(null);
    try {
      setIsLoading(true);
      await onVerify?.(otp);
      onClose();
      onVerificationSuccess?.();
    } catch (error) {
      setError({ type: 'verification', error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestingOtp = async (phone: string) => {
    setError(null);

    try {
      setRequestingOtp(true);
      await onRequestOtp(phone);
      setMode('verify-otp');
    } catch (error) {
      setError({ type: 'request', error });
    } finally {
      setRequestingOtp(false);
    }
  };
  return (
    <React.Fragment>
      <ModalHeader className={styles.sectionHeader} closeModal={onClose}>
        {t('otpVerification', 'OTP Verification')}
      </ModalHeader>
      <ModalBody>
        {requestingOtp && <InlineLoading />}
        {!requestingOtp && (
          <div>
            {error && (
              <>
                <InlineNotification
                  lowContrast
                  title={
                    error?.type === 'request'
                      ? t('otpRequestError', 'Error requesting OTP')
                      : t('otpVerificationError', 'Error Verifying OTP')
                  }
                  subtitle={error?.error?.message}
                />
                <br />
              </>
            )}
            {mode === 'landing' ? (
              <Tile role="button" onClick={() => handleRequestingOtp(phoneNumber)}>
                {renderOtpTrigger(phoneNumber)}
              </Tile>
            ) : mode === 'verify-otp' ? (
              <PinPut
                value={otp}
                onChange={setOtp}
                numInputs={otpLength}
                centerBoxes={centerBoxes}
                obsecureText={obsecureText}
              />
            ) : null}
            {mode === 'landing' && (
              <>
                <br />
                <Button
                  className={styles.changeNoBtn}
                  size="sm"
                  onClick={() => setMode('change-number')}
                  kind="tertiary"
                  renderIcon={Phone}>
                  {t('changePhoneNumber', 'Change phone number')}
                </Button>
              </>
            )}
            {mode === 'change-number' && (
              <TextInput
                id={'otp-phone-number'}
                labelText={t('phoneNumber', 'Phone number')}
                value={newPhoneNumber}
                onChange={(ev) => setNewPhoneNumber(ev.target.value)}
              />
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={onClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>
          {mode !== 'change-number' ? (
            <Button
              disabled={isLoading || otp.length !== otpLength}
              kind="primary"
              onClick={handleVerify}
              className={styles.button}>
              {isLoading ? <InlineLoading title={t('verifyingOtp', 'Verifying OTP')} /> : t('verify', 'Verify')}
            </Button>
          ) : (
            <Button
              disabled={!PHONE_NUMBER_REGEX.test(newPhoneNumber)}
              onClick={() => handleRequestingOtp(newPhoneNumber)}>
              {t('sendOtp', 'Send OTP')}
            </Button>
          )}
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default OTPVerificationModal;
