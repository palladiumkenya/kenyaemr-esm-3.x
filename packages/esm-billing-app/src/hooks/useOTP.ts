import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { OtpPayload, OtpResponse, ClaimSummary } from '../types';

/**
 * Generates a random OTP of a specified length.
 */
export function generateOTP(length = 5) {
  let otpNumbers = '0123456789';
  let OTP = '';
  const len = otpNumbers.length;
  for (let i = 0; i < length; i++) {
    OTP += otpNumbers[Math.floor(Math.random() * len)];
  }
  return OTP;
}

/**
 * Replaces placeholders in a template string with values from a given context.
 */
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

/**
 * Builds a URL for sending an SMS message.
 */
function buildSmsUrl(message: string, receiver: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `${restBaseUrl}/kenyaemr/send-kenyaemr-sms?message=${encodedMessage}&phone=${receiver}`;
}

/**
 * Validates that the required parameters for sending an OTP message are present.
 */
function validateOtpInputs(otp: string, receiver: string, patientName: string): void {
  if (!otp?.trim() || !receiver?.trim() || !patientName?.trim()) {
    throw new Error('Missing required parameters: otp, receiver, or patientName');
  }
}

/**
 * Sends an OTP message to a patient's phone number with claim details.
 */
export async function sendOtp(
  payload: OtpPayload,
  patientName: string,
  claimSummary: ClaimSummary,
  expiryMinutes: number = 5,
): Promise<OtpResponse> {
  const { otp, receiver } = payload;
  validateOtpInputs(otp, receiver, patientName);

  const otpContext = {
    patientName: patientName,
    claimAmount: `KES ${claimSummary.totalAmount.toLocaleString()}`,
    servicesSummary:
      claimSummary.services.length > 100 ? claimSummary.services.substring(0, 97) + '...' : claimSummary.services,
    startDate: claimSummary.startDate,
    endDate: claimSummary.endDate,
    facility: claimSummary.facility,
    expiryTime: expiryMinutes,
    otp: otp,
  };

  const claimConsentTemplate =
    'Dear {{patientName}}, ' +
    'We are submitting a claim to your insurance for services provided from {{startDate}} to {{endDate}} at {{facility}}. ' +
    'Total claim amount: {{claimAmount}}. ' +
    'Services: {{servicesSummary}}. ' +
    'Your OTP for consent is {{otp}} (valid {{expiryTime}} mins). ';

  try {
    const message = parseMessage(otpContext, claimConsentTemplate);
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

export class OTPManager {
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number; expiryTime: number }> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly DEFAULT_EXPIRY_TIME = 5 * 60 * 1000;

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    claimSummary: ClaimSummary,
    expiryMinutes: number = this.DEFAULT_EXPIRY_TIME,
  ): Promise<void> {
    const otp = generateOTP(5);
    const expiryTime = expiryMinutes * 60 * 1000;

    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    const otpData = {
      otp,
      timestamp: Date.now(),
      attempts: 0,
      expiryTime,
    };

    this.otpStore.set(normalizedPhone, otpData);

    await sendOtp({ otp, receiver: phoneNumber }, patientName, claimSummary, expiryMinutes);
  }

  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    const storedData = this.otpStore.get(normalizedPhone);

    if (!storedData) {
      throw new Error('No OTP found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - storedData.timestamp > storedData.expiryTime) {
      this.otpStore.delete(normalizedPhone);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    storedData.attempts++;

    if (storedData.attempts > this.MAX_ATTEMPTS) {
      this.otpStore.delete(normalizedPhone);
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    if (storedData.otp === inputOtp.trim()) {
      this.otpStore.delete(normalizedPhone);
      return true;
    } else {
      this.otpStore.set(normalizedPhone, storedData);
      throw new Error(`Invalid OTP. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
    }
  }

  clearOTP(phoneNumber: string): void {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    this.otpStore.delete(normalizedPhone);
  }

  clearAllOTPs(): void {
    this.otpStore.clear();
  }

  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [phoneNumber, data] of this.otpStore.entries()) {
      if (now - data.timestamp > data.expiryTime) {
        this.otpStore.delete(phoneNumber);
      }
    }
  }

  hasValidOTP(phoneNumber: string): boolean {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(normalizedPhone);
    if (!storedData) {
      return false;
    }

    return Date.now() - storedData.timestamp <= storedData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string): number {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(normalizedPhone);
    if (!storedData) {
      return 0;
    }

    const elapsed = Date.now() - storedData.timestamp;
    const remaining = Math.max(0, storedData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string): number {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(normalizedPhone);
    if (!storedData) {
      return 0;
    }

    return Math.max(0, this.MAX_ATTEMPTS - storedData.attempts);
  }

  getStoredOTP(phoneNumber: string): string | null {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(normalizedPhone);
    return storedData ? storedData.otp : null;
  }

  transferOTP(oldPhoneNumber: string, newPhoneNumber: string): boolean {
    const oldNormalized = this.normalizePhoneNumber(oldPhoneNumber);
    const newNormalized = this.normalizePhoneNumber(newPhoneNumber);

    if (oldNormalized === newNormalized) {
      return true;
    }

    const storedData = this.otpStore.get(oldNormalized);
    if (!storedData) {
      return false;
    }

    this.otpStore.set(newNormalized, storedData);
    this.otpStore.delete(oldNormalized);

    return true;
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) {
      return '';
    }

    let normalized = phoneNumber.replace(/\D/g, '');

    if (normalized.startsWith('254') && normalized.length === 12) {
      return normalized;
    } else if (normalized.startsWith('0') && normalized.length === 10) {
      return '254' + normalized.substring(1);
    } else if (normalized.length === 9) {
      return '254' + normalized;
    }

    return normalized;
  }
}

export const otpManager = new OTPManager();

setInterval(() => {
  otpManager.cleanupExpiredOTPs();
}, 2 * 60 * 1000);

export function createOtpHandlers(patientName: string, expiryMinutes: number) {
  return {
    onRequestOtp: async (phone: string, claimSummary: ClaimSummary): Promise<void> => {
      await otpManager.requestOTP(phone, patientName, claimSummary, expiryMinutes);
    },
    onVerify: async (otp: string, phoneNumber: string): Promise<void> => {
      const isValid = await otpManager.verifyOTP(phoneNumber, otp);
      if (!isValid) {
        throw new Error('OTP verification failed');
      }
    },
    hasValidOTP: (phone: string): boolean => {
      return otpManager.hasValidOTP(phone);
    },
    getRemainingTime: (phone: string): number => {
      return otpManager.getRemainingTimeMinutes(phone);
    },
    getRemainingAttempts: (phone: string): number => {
      return otpManager.getRemainingAttempts(phone);
    },
    clearOTP: (phone: string): void => {
      otpManager.clearOTP(phone);
    },
    clearAllOTPs: (): void => {
      otpManager.clearAllOTPs();
    },
    getStoredOTP: (phone: string): string | null => {
      return otpManager.getStoredOTP(phone);
    },
    transferOTP: (oldPhone: string, newPhone: string): boolean => {
      return otpManager.transferOTP(oldPhone, newPhone);
    },
  };
}
