import {
  Button,
  ButtonSet,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
  IconButton,
} from '@carbon/react';
import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './otp-verification.scss';
import PinPut from '../pin-put/pinput.component';
import { Phone, Edit } from '@carbon/react/icons';
import { PHONE_NUMBER_REGEX } from '../../constants';
import OTPCountdown from './pin-counter/pin-counter.component';
import { maskPhoneNumber } from '../utils';

type OTPVerificationModalProps = {
  onClose?: () => void;
  otpLength?: number;
  onVerify?: (otp: string) => Promise<void>;
  onVerificationSuccess?: () => void;
  obscureText?: boolean;
  centerBoxes?: boolean;
  phoneNumber: string;
  onRequestOtp?: (phoneNumber: string) => Promise<void>;
  expiryMinutes?: number;
  onCleanup?: () => void;
};

const OTPVerificationModal: FC<OTPVerificationModalProps> = ({
  onClose,
  onVerify,
  otpLength = 5,
  centerBoxes,
  obscureText,
  phoneNumber,
  onRequestOtp,
  onVerificationSuccess,
  expiryMinutes = 5,
  onCleanup,
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState(phoneNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ type: 'request' | 'verification'; error: Error } | null>(null);
  const [mode, setMode] = useState<'landing' | 'verify-otp' | 'change-number'>('landing');
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState(phoneNumber);

  const [countdownResetTrigger, setCountdownResetTrigger] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  useEffect(() => {
    return () => {
      onCleanup?.();
    };
  }, [onCleanup]);

  const handleClose = () => {
    onCleanup?.();
    onClose?.();
  };

  const handleVerify = async () => {
    setError(null);
    try {
      setIsLoading(true);
      await onVerify?.(otp);
      onVerificationSuccess?.();
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      setError({ type: 'verification', error: error as Error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestingOtp = async (phone: string) => {
    setError(null);
    try {
      setRequestingOtp(true);
      await onRequestOtp?.(phone);

      setOtp('');
      setCurrentPhoneNumber(phone);
      setMode('verify-otp');

      setIsCountdownActive(true);
      setCountdownResetTrigger((prev) => prev + 1);
    } catch (error) {
      setError({ type: 'request', error: error as Error });
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleUseDifferentNumber = () => {
    setOtp('');
    setIsCountdownActive(false);
    setNewPhoneNumber(currentPhoneNumber);
    setMode('change-number');
  };

  const handleBackToLanding = () => {
    setNewPhoneNumber(currentPhoneNumber);
    setMode('landing');
  };

  const handleCountdownExpired = () => {
    setError({
      type: 'verification',
      error: new Error(t('otpExpiredMessage', 'OTP has expired. Please request a new one.')),
    });
    setOtp('');
    setIsCountdownActive(false);
    setMode('landing');
    onCleanup?.();
  };

  const isValidPhoneNumber = (phone: string) => {
    return PHONE_NUMBER_REGEX.test(phone);
  };

  return (
    <React.Fragment>
      <ModalHeader className={styles.sectionHeader} closeModal={handleClose}>
        {t('otpVerification', 'OTP Verification')}
      </ModalHeader>
      <ModalBody>
        {requestingOtp && <InlineLoading description={t('requestingOtp', 'Requesting OTP...')} />}
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
              <div className={styles.otpTriggerContainer}>
                <p>{t('confirmationTxt', 'Verify the phone number before OTP')}</p>
                <div className={styles.phoneNumberDisplay}>
                  <Phone className={styles.phoneIcon} />
                  <span className={styles.phoneNumber}>{maskPhoneNumber(currentPhoneNumber)}</span>
                  <IconButton
                    kind="ghost"
                    size="sm"
                    label={t('changePhoneNumber', 'Change phone number')}
                    onClick={handleUseDifferentNumber}
                    className={styles.editButton}>
                    <Edit />
                  </IconButton>
                </div>
                <div className={styles.expiryInfo}>
                  <p className={styles.expiryText}>
                    {t('otpExpiryInfo', 'The OTP will be valid for {{minutes}} minutes after it is sent.', {
                      minutes: expiryMinutes,
                    })}
                  </p>
                </div>
              </div>
            ) : mode === 'verify-otp' ? (
              <div className={styles.otpInputContainer}>
                <div className={styles.otpInstruction}>
                  {t('enterOtpSentTo', 'Enter the OTP code sent to')}{' '}
                  <strong>{maskPhoneNumber(currentPhoneNumber)}</strong>
                </div>

                {isCountdownActive && (
                  <div className={styles.countdownSection}>
                    <OTPCountdown
                      expiryMinutes={expiryMinutes}
                      isActive={isCountdownActive}
                      resetTrigger={countdownResetTrigger}
                      onExpired={handleCountdownExpired}
                      variant="default"
                      showIcon={true}
                    />
                  </div>
                )}

                <PinPut
                  value={otp}
                  onChange={setOtp}
                  numInputs={otpLength}
                  centerBoxes={centerBoxes}
                  obscureText={obscureText}
                />
                <Button kind="ghost" size="sm" className={styles.changeNumberLink} onClick={handleUseDifferentNumber}>
                  {t('useADifferentNumber', 'Use a different number')}
                </Button>
              </div>
            ) : mode === 'change-number' ? (
              <div className={styles.changeNumberContainer}>
                <TextInput
                  id={'otp-phone-number'}
                  labelText={t('phoneNumber', 'Phone number')}
                  value={newPhoneNumber}
                  onChange={(ev) => setNewPhoneNumber(ev.target.value)}
                  placeholder={t('enterPhoneNumber', 'Enter phone number')}
                  className={styles.phoneInput}
                  invalid={newPhoneNumber.length > 0 && !isValidPhoneNumber(newPhoneNumber)}
                  invalidText={t('invalidPhoneNumber', 'Please enter a valid phone number')}
                />
                <Button kind="ghost" size="sm" onClick={handleBackToLanding} className={styles.backButton}>
                  {t('back', 'Back')}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={handleClose} className={styles.button}>
            {t('cancel', 'Cancel')}
          </Button>

          {mode === 'landing' && (
            <Button
              kind="primary"
              size="lg"
              className={styles.sendOtpButton}
              disabled={requestingOtp}
              onClick={() => handleRequestingOtp(currentPhoneNumber)}>
              {requestingOtp ? (
                <InlineLoading description={t('sendingOtp', 'Sending OTP...')} />
              ) : error?.type === 'request' ? (
                t('resendOtp', 'Resend OTP')
              ) : (
                t('sendOtpCode', 'Send OTP Code')
              )}
            </Button>
          )}

          {mode === 'verify-otp' && (
            <>
              <Button
                disabled={isLoading || otp.length !== otpLength}
                kind="primary"
                onClick={handleVerify}
                className={styles.button}>
                {isLoading ? <InlineLoading description={t('verifyingOtp', 'Verifying OTP')} /> : t('verify', 'Verify')}
              </Button>
            </>
          )}

          {mode === 'change-number' && (
            <Button
              disabled={!isValidPhoneNumber(newPhoneNumber) || requestingOtp}
              kind="primary"
              onClick={() => handleRequestingOtp(newPhoneNumber)}
              className={styles.button}>
              {requestingOtp ? (
                <InlineLoading description={t('reSendingOtp', 'Resending OTP...')} />
              ) : (
                t('sendOtp', 'Send OTP')
              )}
            </Button>
          )}
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};

export default OTPVerificationModal;
