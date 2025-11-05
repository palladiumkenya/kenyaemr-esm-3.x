import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ClaimSummary, OTPSource } from '../types';
import { formatKenyanPhoneNumber } from '../invoice/payments/utils';

/**
 * Generates a random OTP of a specified length.
 */
export function generateOTP(length = 5): string {
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
 * Builds a URL for sending an SMS message using the KenyaEMR SMS API.
 */
function buildSmsUrl(message: string, receiver: string, nationalId: string | null = null): string {
  const encodedMessage = encodeURIComponent(message);
  const formattedReceiver = formatKenyanPhoneNumber(receiver);
  let url = `${restBaseUrl}/kenyaemr/send-kenyaemr-sms?message=${encodedMessage}&phone=${formattedReceiver}`;

  if (nationalId?.trim()) {
    url += `&nationalId=${encodeURIComponent(nationalId)}`;
  }
  return url;
}

/**
 * Validates that the required parameters for sending an OTP message are present.
 */
function validateOtpInputs(receiver: string, patientName: string): void {
  if (!receiver?.trim() || !patientName?.trim()) {
    throw new Error('Missing required parameters: receiver or patientName');
  }
}

/**
 * Hook to get OTP source configuration
 */
export const useOtpSource = () => {
  const url = `${restBaseUrl}/kenyaemr/checkotpsource`;

  const { data, error, isLoading } = useSWR<FetchResponse<OTPSource>>(url, openmrsFetch);

  return {
    otpSource: data?.data?.otpSource,
    data,
    error,
    isLoading,
  };
};

/**
 * Sends OTP via SMS for KEHMIS workflow (client generates OTP)
 */
async function sendOtpKehmis(
  otp: string,
  receiver: string,
  patientName: string,
  claimSummary: ClaimSummary,
  expiryMinutes: number = 5,
  nationalId: string | null = null,
): Promise<void> {
  validateOtpInputs(receiver, patientName);

  const context = {
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
    const message = parseMessage(context, claimConsentTemplate);
    const url = buildSmsUrl(message, receiver, nationalId);

    const response = await openmrsFetch(url, {
      method: 'POST',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to send OTP: ${errorMessage}`);
  }
}

class KehmisOTPManager {
  private otpStore: Map<
    string,
    { otp: string; timestamp: number; attempts: number; expiryTime: number; claimSummary: ClaimSummary }
  > = new Map();
  private readonly MAX_ATTEMPTS = 3;

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    claimSummary: ClaimSummary,
    expiryMinutes: number = 5,
    nationalId: string | null = null,
  ): Promise<void> {
    const otp = generateOTP(5);
    const expiryTime = expiryMinutes * 60 * 1000;
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);

    const otpData = {
      otp,
      timestamp: Date.now(),
      attempts: 0,
      expiryTime,
      claimSummary,
    };

    this.otpStore.set(formattedPhone, otpData);

    await sendOtpKehmis(otp, formattedPhone, patientName, claimSummary, expiryMinutes, nationalId);
  }

  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(formattedPhone);

    if (!storedData) {
      throw new Error('No OTP found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - storedData.timestamp > storedData.expiryTime) {
      this.otpStore.delete(formattedPhone);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    storedData.attempts++;

    if (storedData.attempts > this.MAX_ATTEMPTS) {
      this.otpStore.delete(formattedPhone);
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    if (storedData.otp === inputOtp.trim()) {
      this.otpStore.delete(formattedPhone);
      return true;
    } else {
      this.otpStore.set(formattedPhone, storedData);
      throw new Error(`Invalid OTP. ${this.MAX_ATTEMPTS - storedData.attempts} attempts remaining.`);
    }
  }

  clearOTP(phoneNumber: string): void {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    this.otpStore.delete(formattedPhone);
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
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(formattedPhone);
    if (!storedData) {
      return false;
    }
    return Date.now() - storedData.timestamp <= storedData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string): number {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(formattedPhone);
    if (!storedData) {
      return 0;
    }
    const elapsed = Date.now() - storedData.timestamp;
    const remaining = Math.max(0, storedData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string): number {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(formattedPhone);
    if (!storedData) {
      return 0;
    }
    return Math.max(0, this.MAX_ATTEMPTS - storedData.attempts);
  }

  transferOTP(oldPhoneNumber: string, newPhoneNumber: string): boolean {
    const oldFormatted = formatKenyanPhoneNumber(oldPhoneNumber);
    const newFormatted = formatKenyanPhoneNumber(newPhoneNumber);

    if (oldFormatted === newFormatted) {
      return true;
    }

    const sessionData = this.otpStore.get(oldFormatted);
    if (!sessionData) {
      return false;
    }

    this.otpStore.set(newFormatted, sessionData);
    this.otpStore.delete(oldFormatted);

    return true;
  }

  formatPhone(phoneNumber: string): string {
    return formatKenyanPhoneNumber(phoneNumber);
  }
}

// ============================================================================
// HIE STRATEGY (Server-side OTP generation and validation)
// ============================================================================

/**
 * Requests OTP from server (server generates and sends OTP)
 */
async function requestOtpFromServer(
  receiver: string,
  patientName: string,
  claimSummary: ClaimSummary,
  expiryMinutes: number = 5,
  nationalId: string | null = null,
): Promise<{ id: string; message: string }> {
  validateOtpInputs(receiver, patientName);

  const formattedPhone = formatKenyanPhoneNumber(receiver);

  const context = {
    patientName: patientName,
    claimAmount: `KES ${claimSummary.totalAmount.toLocaleString()}`,
    servicesSummary:
      claimSummary.services.length > 100 ? claimSummary.services.substring(0, 97) + '...' : claimSummary.services,
    startDate: claimSummary.startDate,
    endDate: claimSummary.endDate,
    facility: claimSummary.facility,
    expiryTime: expiryMinutes,
    otp: '{{OTP}}',
  };

  const claimConsentTemplate =
    'Dear {{patientName}}, ' +
    'We are submitting a claim to your insurance for services provided from {{startDate}} to {{endDate}} at {{facility}}. ' +
    'Total claim amount: {{claimAmount}}. ' +
    'Services: {{servicesSummary}}. ' +
    'Your OTP for consent is {{otp}} (valid {{expiryTime}} mins). ';

  try {
    const message = parseMessage(context, claimConsentTemplate);
    const url = buildSmsUrl(message, formattedPhone, nationalId);

    const response = await openmrsFetch(url, {
      method: 'POST',
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let responseText = await response.text();

    let unwrappedText: string;
    try {
      unwrappedText = JSON.parse(responseText);
    } catch (e) {
      unwrappedText = responseText;
    }

    const jsonMatch = unwrappedText.match(/\{.*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in server response');
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error('Invalid JSON response from server');
    }

    if (data.status === 'success' && data.id) {
      return {
        id: data.id,
        message: data.message || 'OTP sent successfully',
      };
    } else {
      const errorMessage = data.message || 'Failed to send OTP - no ID returned';
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('Failed to send OTP')) {
        throw error;
      }
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
    throw new Error('Failed to send OTP: Unknown error occurred');
  }
}

/**
 * Verifies OTP with server
 */
async function verifyOtpWithServer(otpId: string, otp: string): Promise<boolean> {
  try {
    const url = `${restBaseUrl}/kenyaemr/validate-otp`;

    const response = await openmrsFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: otpId,
        otp: otp.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawText = await response.text();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawText);
    } catch (e) {
      throw new Error('Invalid response from server');
    }

    let data = parsedResponse;
    if (parsedResponse.response && typeof parsedResponse.response === 'string') {
      try {
        data = JSON.parse(parsedResponse.response);
      } catch (e) {
        throw new Error('Invalid nested response from server');
      }
    }

    if (data.status === 'success' || data.valid === true) {
      return true;
    } else {
      const errorMessage = data.message || 'Invalid OTP';
      throw new Error(errorMessage);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
    throw new Error(errorMessage);
  }
}

class HieOTPManager {
  private otpSessions: Map<
    string,
    {
      otpId: string;
      timestamp: number;
      attempts: number;
      expiryTime: number;
      nationalId?: string | null;
      phoneNumber: string;
      claimSummary: ClaimSummary;
    }
  > = new Map();
  private readonly MAX_ATTEMPTS = 3;

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    claimSummary: ClaimSummary,
    expiryMinutes: number = 5,
    nationalId: string | null = null,
  ): Promise<void> {
    const expiryTime = expiryMinutes * 60 * 1000;
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);

    try {
      const { id, message } = await requestOtpFromServer(
        formattedPhone,
        patientName,
        claimSummary,
        expiryMinutes,
        nationalId,
      );

      const sessionData = {
        otpId: id,
        timestamp: Date.now(),
        attempts: 0,
        expiryTime,
        nationalId,
        phoneNumber: formattedPhone,
        claimSummary,
      };

      this.otpSessions.set(formattedPhone, sessionData);
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const sessionData = this.otpSessions.get(formattedPhone);

    if (!sessionData) {
      throw new Error('No OTP session found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - sessionData.timestamp > sessionData.expiryTime) {
      this.otpSessions.delete(formattedPhone);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    sessionData.attempts++;

    if (sessionData.attempts > this.MAX_ATTEMPTS) {
      this.otpSessions.delete(formattedPhone);
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    try {
      const isValid = await verifyOtpWithServer(sessionData.otpId, inputOtp);

      if (isValid) {
        this.otpSessions.delete(formattedPhone);
        return true;
      } else {
        this.otpSessions.set(formattedPhone, sessionData);
        throw new Error(`Invalid OTP. ${this.MAX_ATTEMPTS - sessionData.attempts} attempts remaining.`);
      }
    } catch (error) {
      this.otpSessions.set(formattedPhone, sessionData);

      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      const remainingAttempts = this.MAX_ATTEMPTS - sessionData.attempts;

      if (remainingAttempts > 0) {
        throw new Error(`${errorMessage} ${remainingAttempts} attempts remaining.`);
      } else {
        this.otpSessions.delete(formattedPhone);
        throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
      }
    }
  }

  clearOTP(phoneNumber: string): void {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    this.otpSessions.delete(formattedPhone);
  }

  clearAllOTPs(): void {
    this.otpSessions.clear();
  }

  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [phoneNumber, data] of this.otpSessions.entries()) {
      if (now - data.timestamp > data.expiryTime) {
        this.otpSessions.delete(phoneNumber);
      }
    }
  }

  hasValidOTP(phoneNumber: string): boolean {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const sessionData = this.otpSessions.get(formattedPhone);
    if (!sessionData) {
      return false;
    }
    return Date.now() - sessionData.timestamp <= sessionData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string): number {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const sessionData = this.otpSessions.get(formattedPhone);
    if (!sessionData) {
      return 0;
    }
    const elapsed = Date.now() - sessionData.timestamp;
    const remaining = Math.max(0, sessionData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string): number {
    const formattedPhone = formatKenyanPhoneNumber(phoneNumber);
    const sessionData = this.otpSessions.get(formattedPhone);
    if (!sessionData) {
      return 0;
    }
    return Math.max(0, this.MAX_ATTEMPTS - sessionData.attempts);
  }

  transferOTP(oldPhoneNumber: string, newPhoneNumber: string): boolean {
    const oldFormatted = formatKenyanPhoneNumber(oldPhoneNumber);
    const newFormatted = formatKenyanPhoneNumber(newPhoneNumber);

    if (oldFormatted === newFormatted) {
      return true;
    }

    const sessionData = this.otpSessions.get(oldFormatted);
    if (!sessionData) {
      return false;
    }

    this.otpSessions.set(newFormatted, { ...sessionData, phoneNumber: newFormatted });
    this.otpSessions.delete(oldFormatted);

    return true;
  }

  formatPhone(phoneNumber: string): string {
    return formatKenyanPhoneNumber(phoneNumber);
  }
}

// ============================================================================
// ADAPTER - Unified OTP Manager Interface
// ============================================================================

interface IOTPManager {
  requestOTP(
    phoneNumber: string,
    patientName: string,
    claimSummary: ClaimSummary,
    expiryMinutes?: number,
    nationalId?: string | null,
  ): Promise<void>;
  verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean>;
  clearOTP(phoneNumber: string): void;
  clearAllOTPs(): void;
  cleanupExpiredOTPs(): void;
  hasValidOTP(phoneNumber: string): boolean;
  getRemainingTimeMinutes(phoneNumber: string): number;
  getRemainingAttempts(phoneNumber: string): number;
  transferOTP(oldPhoneNumber: string, newPhoneNumber: string): boolean;
  formatPhone(phoneNumber: string): string;
}

class OTPManagerAdapter implements IOTPManager {
  private kehmisManager: KehmisOTPManager;
  private hieManager: HieOTPManager;
  private currentSource: string;

  constructor(otpSource: string = 'kehmis') {
    this.kehmisManager = new KehmisOTPManager();
    this.hieManager = new HieOTPManager();
    this.currentSource = otpSource;
  }

  setOtpSource(source: string) {
    this.currentSource = source;
  }

  private getManager(): IOTPManager {
    return this.currentSource === 'hie' ? this.hieManager : this.kehmisManager;
  }

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    claimSummary: ClaimSummary,
    expiryMinutes: number = 5,
    nationalId: string | null = null,
  ): Promise<void> {
    return this.getManager().requestOTP(phoneNumber, patientName, claimSummary, expiryMinutes, nationalId);
  }

  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    return this.getManager().verifyOTP(phoneNumber, inputOtp);
  }

  clearOTP(phoneNumber: string): void {
    this.kehmisManager.clearOTP(phoneNumber);
    this.hieManager.clearOTP(phoneNumber);
  }

  clearAllOTPs(): void {
    this.kehmisManager.clearAllOTPs();
    this.hieManager.clearAllOTPs();
  }

  cleanupExpiredOTPs(): void {
    this.kehmisManager.cleanupExpiredOTPs();
    this.hieManager.cleanupExpiredOTPs();
  }

  hasValidOTP(phoneNumber: string): boolean {
    return this.getManager().hasValidOTP(phoneNumber);
  }

  getRemainingTimeMinutes(phoneNumber: string): number {
    return this.getManager().getRemainingTimeMinutes(phoneNumber);
  }

  getRemainingAttempts(phoneNumber: string): number {
    return this.getManager().getRemainingAttempts(phoneNumber);
  }

  transferOTP(oldPhoneNumber: string, newPhoneNumber: string): boolean {
    return this.getManager().transferOTP(oldPhoneNumber, newPhoneNumber);
  }

  formatPhone(phoneNumber: string): string {
    return formatKenyanPhoneNumber(phoneNumber);
  }
}

// Export singleton instance
export const otpManager = new OTPManagerAdapter();

// Cleanup interval
setInterval(() => {
  otpManager.cleanupExpiredOTPs();
}, 2 * 60 * 1000);
