import { showModal } from '@openmrs/esm-framework';
import { default as otpVerificationModal } from './otp-verification.modal';
/**
 * Options for configuring the OTP Verification modal.
 *
 * @property {number} [otpLength] - The number of digits required for the OTP. Defaults to implementation-specific value.
 * @property {(otp: string) => Promise<void>} [onVerify] - Callback invoked when the user submits the OTP. Should return a promise that resolves on successful verification.
 * @property {boolean} [obscureText] - If true, the OTP input will be obscured (e.g., password-style input).
 * @property {boolean} [centerBoxes] - If true, OTP input boxes will be centered in the modal.
 * @property {string} phoneNumber - The phone number to which the OTP will be sent.
 * @property {(phoneNumber: string) => React.ReactNode} renderOtpTrigger - Function to render a custom component for triggering OTP requests.
 * @property {(phoneNumber: string) => Promise<void>} [onRequestOtp] - Callback invoked to request a new OTP for the given phone number. Should return a promise.
 * @property {() => void} [onVerificationSuccess] - Callback invoked when OTP verification succeeds.
 *
 * @example
 * <Button
 *   onClick={() =>
 *     launchOtpVerificationModal({
 *       otpLength: 4,
 *       obscureText: false,
 *       phoneNumber: '254700000000',
 *       renderOtpTrigger: (p) => (
 *         <>
 *           <p>Any customcomponents here {p}</p>
 *         </>
 *       ),
 *       onRequestOtp: (phone) =>
 *         new Promise((resolve, reject) => {
 *           const success = false;
 *           setTimeout(() => (success ? resolve() : reject(new Error('Some error'))), 3000);
 *         }),
 *       onVerify: async (otp) =>
 *         new Promise((resolve, reject) => {
 *           const success = false;
 *           setTimeout(() => (success ? resolve() : reject(new Error('Some error'))), 3000);
 *         }),
 *     })
 *   }
 * >
 *   Launch Otp verification Modal
 * </Button>
 */
export type OTPVerificationModalOptions = {
  otpLength?: number;
  onVerify?: (otp: string) => Promise<void>;
  obscureText?: boolean;
  centerBoxes?: boolean;
  phoneNumber: string;
  renderOtpTrigger: (phoneNumber: string) => React.ReactNode;
  onRequestOtp?: (phoneNumber: string) => Promise<void>;
  onVerificationSuccess?: () => void;
};

/**
 *
 *
 */
export const launchOtpVerificationModal = (props: OTPVerificationModalOptions) => {
  const dispose = showModal('otp-verification-modal', {
    onClose: () => dispose(),
    size: 'xs',
    ...props,
  });
};
export default otpVerificationModal;
