import { showModal } from '@openmrs/esm-framework';
import { default as otpverificationModal } from './otp-verification.modal';
export type OTPVerificationmodalOptions = { otpLength?: number; onVerify?: (otp: string) => Promise<void> };
export const lauchOtpVerificationModal = ({ onVerify, otpLength }: OTPVerificationmodalOptions) => {
  const dispose = showModal('otp-verification-modal', {
    onClose: () => dispose(),
    otpLength,
    onVerify,
  });
};
export default otpverificationModal;
