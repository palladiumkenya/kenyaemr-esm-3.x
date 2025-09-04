import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { OtpContext, OtpPayload, OtpResponse } from '../../type';

/**
 * Generates a random OTP of a specified length.
 *
 * @param {number} [length=5] - The length of the OTP to be generated. Defaults to 5.
 * @returns {string} A random OTP of the specified length.
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
 *
 * This function takes a context object and a template string. It replaces all
 * occurrences of placeholders (e.g. `{{name}}`) with the corresponding value from
 * the context object. If a placeholder does not have a corresponding key in the
 * context, it is left unchanged.
 *
 * @example
 * const context = { name: 'John', age: 30 };
 * const template = 'My name is {{name}} and I am {{age}} years old.';
 * const result = parseMessage(context, template);
 * console.log(result); // 'My name is John and I am 30 years old.'
 *
 * @param {T} context - The context object whose values will be used to replace
 * placeholders in the template.
 * @param {string} template - The template string that will be parsed.
 * @returns {string} The parsed template with placeholders replaced with values from
 * the context.
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
 * Builds a URL for sending an SMS message using the KenyaEMR SMS API.
 *
 * @param {string} message - The message to be sent.
 * @param {string} receiver - The phone number to which the message will be sent.
 * @returns {string} A URL that can be used to send the message.
 */
function buildSmsUrl(message: string, receiver: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `${restBaseUrl}/kenyaemr/send-kenyaemr-sms?message=${encodedMessage}&phone=${receiver}`;
}

/**
 * Validates that the required parameters for sending an OTP message are present.
 *
 * Throws an error if any of the required parameters are missing or empty.
 *
 * @param {string} otp - The OTP to be sent.
 * @param {string} receiver - The phone number to which the OTP will be sent.
 * @param {string} patientName - The name of the patient to whom the OTP is being sent.
 */
function validateOtpInputs(otp: string, receiver: string, patientName: string): void {
  if (!otp?.trim() || !receiver?.trim() || !patientName?.trim()) {
    throw new Error('Missing required parameters: otp, receiver, or patientName');
  }
}

/**
 * Sends an OTP message to a patient's phone number.
 *
 * @param {OtpPayload} payload - An object containing the OTP and the phone number to which it will be sent.
 * @param {string} patientName - The name of the patient to whom the OTP is being sent.
 * @param {number} [expiryMinutes=5] - The number of minutes after which the OTP will expire.
 * @returns {Promise<OtpResponse>} A promise that resolves with the response from the server.
 * @throws {Error} If there is an error sending the OTP, an error is thrown with a message describing the error.
 */
export async function sendOtp(
  payload: OtpPayload,
  patientName: string,
  expiryMinutes: number = 5,
): Promise<OtpResponse> {
  const { otp, receiver } = payload;
  validateOtpInputs(otp, receiver, patientName);

  const context: OtpContext = {
    otp,
    patient_name: patientName,
    expiry_time: expiryMinutes,
  };

  const messageTemplate =
    'Dear {{patient_name}}, Your OTP to access your Shared Health Records is {{otp}}.' +
    ' By entering this code, you consent to accessing your records. Valid for {{expiry_time}} minutes.';

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

export class OTPManager {
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number; expiryTime: number }> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly DEFAULT_EXPIRY_TIME = 5 * 60 * 1000;

  async requestOTP(phoneNumber: string, patientName: string, expiryMinutes: number = 5): Promise<void> {
    const otp = generateOTP(5);
    const expiryTime = expiryMinutes * 60 * 1000;

    const otpData = {
      otp,
      timestamp: Date.now(),
      attempts: 0,
      expiryTime,
    };

    this.otpStore.set(phoneNumber, otpData);

    await sendOtp({ otp, receiver: phoneNumber }, patientName, expiryMinutes);
  }

  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const storedData = this.otpStore.get(phoneNumber);

    if (!storedData) {
      throw new Error('No OTP found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - storedData.timestamp > storedData.expiryTime) {
      this.otpStore.delete(phoneNumber);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    storedData.attempts++;

    if (storedData.attempts > this.MAX_ATTEMPTS) {
      this.otpStore.delete(phoneNumber);
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    if (storedData.otp === inputOtp.trim()) {
      this.otpStore.delete(phoneNumber);
      return true;
    } else {
      this.otpStore.set(phoneNumber, storedData);
      throw new Error(`Invalid OTP. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
    }
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
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) {
      return false;
    }

    return Date.now() - storedData.timestamp <= storedData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string): number {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) {
      return 0;
    }

    const elapsed = Date.now() - storedData.timestamp;
    const remaining = Math.max(0, storedData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string): number {
    const storedData = this.otpStore.get(phoneNumber);
    if (!storedData) {
      return 0;
    }

    return Math.max(0, this.MAX_ATTEMPTS - storedData.attempts);
  }
}

export const otpManager = new OTPManager();

setInterval(() => {
  otpManager.cleanupExpiredOTPs();
}, 2 * 60 * 1000);

export function createOtpHandlers(patientName: string, expiryMinutes: number) {
  return {
    onRequestOtp: async (phone: string): Promise<void> => {
      await otpManager.requestOTP(phone, patientName, expiryMinutes);
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
  };
}
