import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { OtpContext, OtpPayload, OtpResponse } from '../../type';

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
  let url = `${restBaseUrl}/kenyaemr/send-kenyaemr-sms?message=${encodedMessage}&phone=${receiver}`;

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
 * Sends an OTP request to the server which generates and sends the OTP via SMS.
 * Returns the OTP session ID needed for verification.
 */
export async function requestOtpFromServer(
  receiver: string,
  patientName: string,
  expiryMinutes: number = 5,
  nationalId: string | null = null,
): Promise<{ id: string; message: string }> {
  validateOtpInputs(receiver, patientName);

  const context: OtpContext = {
    otp: '{{OTP}}',
    patient_name: patientName,
    expiry_time: expiryMinutes,
  };

  const messageTemplate =
    'Dear {{patient_name}}, Your OTP to access your Shared Health Records is {{otp}}.' +
    ' By entering this code, you consent to accessing your records. Valid for {{expiry_time}} minutes.';

  try {
    const message = parseMessage(context, messageTemplate);
    const url = buildSmsUrl(message, receiver, nationalId);

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
    expiryMinutes: number = 5,
    nationalId: string | null = null,
  ): Promise<void> {
    const expiryTime = expiryMinutes * 60 * 1000;

    try {
      const { id, message } = await requestOtpFromServer(phoneNumber, patientName, expiryMinutes, nationalId);

      const sessionData = {
        otpId: id,
        timestamp: Date.now(),
        attempts: 0,
        expiryTime,
        nationalId,
        phoneNumber,
      };

      this.otpSessions.set(phoneNumber, sessionData);
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(phoneNumber: string, inputOtp: string): Promise<boolean> {
    const sessionData = this.otpSessions.get(phoneNumber);

    if (!sessionData) {
      throw new Error('No OTP session found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - sessionData.timestamp > sessionData.expiryTime) {
      this.otpSessions.delete(phoneNumber);
      throw new Error('OTP has expired. Please request a new OTP.');
    }

    sessionData.attempts++;

    if (sessionData.attempts > this.MAX_ATTEMPTS) {
      this.otpSessions.delete(phoneNumber);
      throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    try {
      const isValid = await verifyOtpWithServer(sessionData.otpId, inputOtp);

      if (isValid) {
        this.otpSessions.delete(phoneNumber);
        return true;
      } else {
        this.otpSessions.set(phoneNumber, sessionData);
        throw new Error(`Invalid OTP. ${this.MAX_ATTEMPTS - sessionData.attempts} attempts remaining.`);
      }
    } catch (error) {
      this.otpSessions.set(phoneNumber, sessionData);

      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      const remainingAttempts = this.MAX_ATTEMPTS - sessionData.attempts;

      if (remainingAttempts > 0) {
        throw new Error(`${errorMessage} ${remainingAttempts} attempts remaining.`);
      } else {
        this.otpSessions.delete(phoneNumber);
        throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
      }
    }
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
    const sessionData = this.otpSessions.get(phoneNumber);
    if (!sessionData) {
      return false;
    }

    return Date.now() - sessionData.timestamp <= sessionData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string): number {
    const sessionData = this.otpSessions.get(phoneNumber);
    if (!sessionData) {
      return 0;
    }

    const elapsed = Date.now() - sessionData.timestamp;
    const remaining = Math.max(0, sessionData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string): number {
    const sessionData = this.otpSessions.get(phoneNumber);
    if (!sessionData) {
      return 0;
    }

    return Math.max(0, this.MAX_ATTEMPTS - sessionData.attempts);
  }
}

export const otpManager = new OTPManager();

setInterval(() => {
  otpManager.cleanupExpiredOTPs();
}, 2 * 60 * 1000);

export function createOtpHandlers(patientName: string, expiryMinutes: number, nationalId: string | null = null) {
  return {
    onRequestOtp: async (phone: string): Promise<void> => {
      await otpManager.requestOTP(phone, patientName, expiryMinutes, nationalId);
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
