// otp-management.service.ts
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { OtpContext, OtpPayload, OtpResponse } from '../../type';

// Keep your existing utility functions
export function generateOTP(length = 5) {
  let otpNumbers = '0123456789';
  let OTP = '';
  const len = otpNumbers.length;
  for (let i = 0; i < length; i++) {
    OTP += otpNumbers[Math.floor(Math.random() * len)];
  }
  return OTP;
}

export function parseMessage<T extends Record<string, string | number>>(context: T, template: string): string {
  if (!template?.trim()) {
    throw new Error('Template must be a non-empty string');
  }

  const placeholderRegex = /\{\{([^{}]+)\}\}/g;

  return template.replace(placeholderRegex, (match, key: string) => {
    const trimmedKey = key.trim();
    return trimmedKey in context ? String(context[trimmedKey]) : match;
  });
}

function buildSmsUrl(message: string, receiver: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `${restBaseUrl}/kenyaemr/send-kenyaemr-sms?message=${encodedMessage}&phone=${receiver}`;
}

function validateOtpInputs(otp: string, receiver: string, patientName: string): void {
  if (!otp?.trim() || !receiver?.trim() || !patientName?.trim()) {
    throw new Error('Missing required parameters: otp, receiver, or patientName');
  }

  if (!receiver.match(/^\+?[1-9]\d{1,14}$/)) {
    throw new Error('Invalid phone number format');
  }
}

// Updated sendOtp function with expiry minutes support
export async function sendOtp(
  { otp, receiver }: OtpPayload,
  patientName: string,
  expiryMinutes: number = 5,
): Promise<OtpResponse> {
  validateOtpInputs(otp, receiver, patientName);

  const context: OtpContext = {
    otp,
    patient_name: patientName,
    expiry_time: expiryMinutes,
  };

  const messageTemplate =
    'Dear {{patient_name}}, your OTP for accessing your Shared Health Records (SHR) is {{otp}}. ' +
    'Please enter this code to proceed. The code is valid for {{expiry_time}} minutes.';

  try {
    const message = parseMessage(context, messageTemplate);
    const url = buildSmsUrl(message, receiver);

    const response = await openmrsFetch(url, {
      method: 'POST',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to send OTP: ${errorMessage}`);
  }
}

// Updated OTP Management Class with expiry minutes support
export class OTPManager {
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number; expiryTime: number }> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly DEFAULT_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Generate and store OTP for a phone number with configurable expiry
   */
  async requestOTP(phoneNumber: string, patientName: string, expiryMinutes: number = 5): Promise<void> {
    const otp = generateOTP(5);
    const expiryTime = expiryMinutes * 60 * 1000; // Convert minutes to milliseconds

    // Store OTP with metadata including custom expiry time
    this.otpStore.set(phoneNumber, {
      otp,
      timestamp: Date.now(),
      attempts: 0,
      expiryTime,
    });

    // Send OTP via SMS with configurable expiry time
    await sendOtp({ otp, receiver: phoneNumber }, patientName, expiryMinutes);
  }

  /**
   * Verify OTP for a phone number
   */
  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const storedData = this.otpStore.get(phoneNumber);

    if (!storedData) {
      throw new Error('No OTP found for this phone number. Please request a new OTP.');
    }

    // Check if OTP has expired using individual expiry time
    if (Date.now() - storedData.timestamp > storedData.expiryTime) {
      this.otpStore.delete(phoneNumber);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    // Increment attempt count
    storedData.attempts++;

    // Check max attempts
    if (storedData.attempts > this.MAX_ATTEMPTS) {
      this.otpStore.delete(phoneNumber);
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    // Verify OTP
    if (storedData.otp === inputOtp.trim()) {
      this.otpStore.delete(phoneNumber); // Clean up after successful verification
      return true;
    } else {
      // Update the store with incremented attempts
      this.otpStore.set(phoneNumber, storedData);
      throw new Error(`Invalid OTP. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
    }
  }

  /**
   * Clear expired OTPs (cleanup utility)
   */
  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [phoneNumber, data] of this.otpStore.entries()) {
      if (now - data.timestamp > data.expiryTime) {
        this.otpStore.delete(phoneNumber);
      }
    }
  }

  /**
   * Check if OTP exists and is still valid
   */
  hasValidOTP(phoneNumber: string): boolean {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) return false;

    return Date.now() - storedData.timestamp <= storedData.expiryTime;
  }

  /**
   * Get remaining time for an OTP in minutes
   */
  getRemainingTimeMinutes(phoneNumber: string): number {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) return 0;

    const elapsed = Date.now() - storedData.timestamp;
    const remaining = Math.max(0, storedData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000)); // Convert to minutes and round up
  }
}

// Create singleton instance
export const otpManager = new OTPManager();

// Cleanup expired OTPs every 2 minutes
setInterval(() => {
  otpManager.cleanupExpiredOTPs();
}, 2 * 60 * 1000);

// Integration helper for your HIEDisplayCard component
export function createOTPHandlers(patientName: string, phoneNumber: string, expiryMinutes: number = 5) {
  return {
    onRequestOtp: async (phone: string): Promise<void> => {
      await otpManager.requestOTP(phone, patientName, expiryMinutes);
    },
    onVerify: async (otp: string): Promise<void> => {
      const isValid = await otpManager.verifyOTP(phoneNumber, otp);
      if (!isValid) {
        throw new Error('OTP verification failed');
      }
    },
  };
}
