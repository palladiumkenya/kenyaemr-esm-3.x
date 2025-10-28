import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { ClaimSummary } from '../types';
import { formatKenyanPhoneNumber } from '../invoice/payments/utils';

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
 * Verifies the OTP by calling the server's validation endpoint.
 */
export async function verifyOtpWithServer(otpId: string, otp: string): Promise<boolean> {
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

/**
 * Sends an OTP request to the server with claim details which generates and sends the OTP via SMS.
 * Returns the OTP session ID needed for verification.
 */
export async function requestOtpFromServer(
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

export class OTPManager {
  private otpSessions: Map<
    string,
    {
      otpId: string;
      timestamp: number;
      attempts: number;
      expiryTime: number;
      nationalId?: string | null;
      phoneNumber: string;
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

export const otpManager = new OTPManager();

setInterval(() => {
  otpManager.cleanupExpiredOTPs();
}, 2 * 60 * 1000);
