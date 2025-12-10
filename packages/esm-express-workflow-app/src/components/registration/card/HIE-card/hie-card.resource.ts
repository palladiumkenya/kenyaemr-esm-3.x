import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { OtpContext, OtpPayload, OtpResponse, type OTPSource } from '../../type';
import useSWR from 'swr';

class OTPNetworkError extends Error {
  constructor(message: string, public status?: number, public isRetryable: boolean = true) {
    super(message);
    this.name = 'OTPNetworkError';
  }
}

class OTPServerError extends Error {
  constructor(message: string, public details?: any, public isRetryable: boolean = false) {
    super(message);
    this.name = 'OTPServerError';
  }
}

class OTPParseError extends Error {
  constructor(message: string, public rawResponse?: string, public isRetryable: boolean = false) {
    super(message);
    this.name = 'OTPParseError';
  }
}

class OTPValidationError extends Error {
  constructor(message: string, public remainingAttempts?: number) {
    super(message);
    this.name = 'OTPValidationError';
  }
}

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

/**
 * Builds a URL for sending an SMS message.
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
 * Validates required parameters.
 */
function validateOtpInputs(receiver: string, patientName: string): void {
  if (!receiver?.trim() || !patientName?.trim()) {
    throw new OTPValidationError('Missing required parameters: receiver or patientName');
  }

  // Basic phone number validation
  const phoneRegex = /^[0-9+]{10,15}$/;
  if (!phoneRegex.test(receiver.replace(/\s/g, ''))) {
    throw new OTPValidationError('Invalid phone number format');
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
  expiryMinutes: number = 5,
  nationalId: string | null = null,
): Promise<void> {
  validateOtpInputs(receiver, patientName);

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
    const url = buildSmsUrl(message, receiver, nationalId);

    const response = await openmrsFetch(url, {
      method: 'POST',
      redirect: 'follow',
    });

    if (!response.ok) {
      if (response.status >= 500) {
        throw new OTPNetworkError('SMS service temporarily unavailable. Please try again.', response.status);
      } else if (response.status === 429) {
        throw new OTPNetworkError('Too many SMS requests. Please wait a moment.', response.status, false);
      } else {
        throw new OTPNetworkError(`Failed to send SMS (${response.status})`, response.status);
      }
    }
  } catch (error) {
    if (error instanceof OTPNetworkError || error instanceof OTPValidationError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new OTPNetworkError(`Failed to send OTP: ${errorMessage}`);
  }
}

/**
 * Requests OTP from server (server generates and sends OTP)
 * Enhanced with comprehensive error handling
 */
async function requestOtpFromServer(
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

  let response: FetchResponse<any>;
  let responseText: string;

  try {
    const message = parseMessage(context, messageTemplate);
    const url = buildSmsUrl(message, receiver, nationalId);

    response = await openmrsFetch(url, {
      method: 'POST',
      redirect: 'follow',
    });

    if (!response.ok) {
      const statusText = response.statusText || 'Unknown error';

      switch (response.status) {
        case 400:
          throw new OTPNetworkError(
            'Invalid request. Please check the phone number and try again.',
            response.status,
            false,
          );
        case 401:
        case 403:
          throw new OTPNetworkError(
            'Authentication failed. Please contact your administrator.',
            response.status,
            false,
          );
        case 404:
          throw new OTPNetworkError(
            'OTP service not configured. Please contact your administrator.',
            response.status,
            false,
          );
        case 429:
          throw new OTPNetworkError(
            'Too many requests. Please wait 1 minute before trying again.',
            response.status,
            true,
          );
        case 500:
        case 502:
        case 503:
        case 504:
          throw new OTPNetworkError(
            'Server temporarily unavailable. Please try again in a moment.',
            response.status,
            true,
          );
        default:
          throw new OTPNetworkError(
            `Request failed: ${statusText} (${response.status})`,
            response.status,
            response.status < 500,
          );
      }
    }

    // Read response text with error handling
    try {
      responseText = await response.text();
    } catch (textError) {
      throw new OTPParseError('Unable to read server response. Please try again.');
    }

    if (!responseText || responseText.trim() === '') {
      throw new OTPParseError('Server returned an empty response. Please try again.');
    }

    let unwrappedText: string;
    try {
      const parsed = JSON.parse(responseText);
      unwrappedText = typeof parsed === 'string' ? parsed : responseText;
    } catch (e) {
      unwrappedText = responseText;
    }

    // Check if response contains common error patterns before trying to parse JSON
    const lowerText = unwrappedText.toLowerCase();
    if (
      lowerText.includes('failed to send sms') ||
      lowerText.includes('sms sending failed') ||
      lowerText.includes('sms delivery failed') ||
      (lowerText.includes('error') && !lowerText.includes('{'))
    ) {
      // Extract and return the actual error message from the backend
      const cleanMessage = unwrappedText.trim().replace(/^["']|["']$/g, '');
      throw new OTPServerError(
        cleanMessage.substring(0, 200) || 'Failed to send SMS. Please try again.',
        unwrappedText,
        true,
      );
    }

    const jsonMatch = unwrappedText.match(/\{.*\}/s);
    if (!jsonMatch) {
      // If no JSON found but response exists, treat entire response as error message
      if (unwrappedText && unwrappedText.trim().length > 0) {
        const cleanMessage = unwrappedText.trim().replace(/^["']|["']$/g, '');
        throw new OTPServerError(
          cleanMessage.substring(0, 200) || 'Failed to send SMS. Please try again.',
          unwrappedText,
          true,
        );
      }
      throw new OTPParseError('Failed to send SMS. Please try again.', unwrappedText.substring(0, 200));
    }

    let data: any;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new OTPParseError('Unable to parse server response. Please try again.', jsonMatch[0].substring(0, 200));
    }

    if (!data || typeof data !== 'object') {
      throw new OTPServerError('Invalid response structure from server', data);
    }

    if (data.status === 'error' || data.status === 'fail' || data.status === 'failed') {
      const errorMessage = data.message || data.error || 'OTP request failed';
      const isRetryable = data.retryable !== false && data.status !== 'fail';

      throw new OTPServerError(errorMessage, data, isRetryable);
    }

    if (data.status === 'success') {
      if (!data.id) {
        throw new OTPServerError('Server error: No OTP reference ID returned. Please try again.', data, true);
      }

      return {
        id: data.id,
        message: data.message || 'OTP sent successfully',
      };
    }

    throw new OTPServerError('OTP request failed', data, true);
  } catch (error) {
    // Re-throw custom errors as-is
    if (
      error instanceof OTPNetworkError ||
      error instanceof OTPServerError ||
      error instanceof OTPParseError ||
      error instanceof OTPValidationError
    ) {
      throw error;
    }

    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new OTPNetworkError('Network connection failed. Please check your internet connection.', undefined, true);
    }

    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new OTPNetworkError('Request timed out. Please check your connection and try again.', undefined, true);
    }

    if (error instanceof Error && error.message.includes('Template')) {
      throw new OTPServerError(`Configuration error: ${error.message}`, undefined, false);
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new OTPServerError(`Failed to send OTP: ${errorMessage}`, error, true);
  }
}

async function verifyOtpWithServer(otpId: string, otp: string): Promise<boolean> {
  if (!otpId?.trim()) {
    throw new OTPValidationError('Invalid OTP session. Please request a new OTP.');
  }

  if (!otp?.trim()) {
    throw new OTPValidationError('Please enter the OTP code.');
  }

  if (otp.trim().length !== 5) {
    throw new OTPValidationError('OTP must be 5 digits.');
  }

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

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 400) {
        throw new OTPValidationError('Invalid verification request. Please request a new OTP.');
      } else if (response.status === 404) {
        throw new OTPValidationError('OTP session not found or expired. Please request a new OTP.');
      } else if (response.status >= 500) {
        throw new OTPNetworkError(
          'Verification service temporarily unavailable. Please try again.',
          response.status,
          true,
        );
      } else {
        throw new OTPNetworkError(`Verification failed (${response.status})`, response.status);
      }
    }

    // Parse response
    const rawText = await response.text();

    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(rawText);
    } catch (e) {
      throw new OTPParseError('Invalid response from verification service. Please try again.');
    }

    let data = parsedResponse;
    if (parsedResponse.response && typeof parsedResponse.response === 'string') {
      try {
        data = JSON.parse(parsedResponse.response);
      } catch (e) {
        throw new OTPParseError('Invalid response format. Please try again.');
      }
    }

    if (data.status === 'success' || data.valid === true) {
      return true;
    }

    if (data.expired === true || data.status === 'expired') {
      throw new OTPValidationError('OTP has expired. Please request a new OTP.');
    }

    if (data.locked === true || data.status === 'locked') {
      throw new OTPValidationError('Too many failed attempts. Please request a new OTP.');
    }

    const errorMessage = data.message || data.error || 'Invalid OTP code';
    throw new OTPValidationError(errorMessage, data.remainingAttempts);
  } catch (error) {
    if (error instanceof OTPValidationError || error instanceof OTPNetworkError || error instanceof OTPParseError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new OTPNetworkError('Network connection failed. Please check your internet.', undefined, true);
    }

    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new OTPNetworkError('Verification timed out. Please try again.', undefined, true);
    }

    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    throw new OTPServerError(errorMessage, error, true);
  }
}

class KehmisOTPManager {
  private otpStore: Map<
    string,
    { otp: string; timestamp: number; attempts: number; expiryTime: number; patientId?: string }
  > = new Map();
  private readonly MAX_ATTEMPTS = 3;

  private createSessionKey(phoneNumber: string, patientId?: string): string {
    // Create a composite key to allow multiple OTP sessions for the same phone number
    return patientId ? `${phoneNumber}::${patientId}` : phoneNumber;
  }

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    expiryMinutes: number = 5,
    nationalId: string | null = null,
    patientId?: string,
  ): Promise<void> {
    this.cleanupExpiredOTPs();

    const otp = generateOTP(5);
    const expiryTime = expiryMinutes * 60 * 1000;
    const sessionKey = this.createSessionKey(phoneNumber, patientId);

    const otpData = {
      otp,
      timestamp: Date.now(),
      attempts: 0,
      expiryTime,
      patientId,
    };

    this.otpStore.set(sessionKey, otpData);

    try {
      await sendOtpKehmis(otp, phoneNumber, patientName, expiryMinutes, nationalId);
    } catch (error) {
      // Clean up on failure
      this.otpStore.delete(sessionKey);
      throw error;
    }
  }

  async verifyOTP(phoneNumber: string, inputOtp: string, patientId?: string): Promise<boolean> {
    this.cleanupExpiredOTPs();

    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const storedData = this.otpStore.get(sessionKey);

    if (!storedData) {
      throw new OTPValidationError('No OTP found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - storedData.timestamp > storedData.expiryTime) {
      this.otpStore.delete(sessionKey);
      throw new OTPValidationError('OTP has expired. Please request a new OTP.');
    }

    storedData.attempts++;

    if (storedData.attempts > this.MAX_ATTEMPTS) {
      this.otpStore.delete(sessionKey);
      throw new OTPValidationError('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    if (storedData.otp === inputOtp.trim()) {
      this.otpStore.delete(sessionKey);
      return true;
    } else {
      this.otpStore.set(sessionKey, storedData);
      const remaining = this.MAX_ATTEMPTS - storedData.attempts;
      throw new OTPValidationError(
        `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        remaining,
      );
    }
  }

  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [sessionKey, data] of this.otpStore.entries()) {
      if (now - data.timestamp > data.expiryTime) {
        this.otpStore.delete(sessionKey);
      }
    }
  }

  hasValidOTP(phoneNumber: string, patientId?: string): boolean {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const storedData = this.otpStore.get(sessionKey);
    if (!storedData) {
      return false;
    }
    return Date.now() - storedData.timestamp <= storedData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string, patientId?: string): number {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const storedData = this.otpStore.get(sessionKey);
    if (!storedData) {
      return 0;
    }
    const elapsed = Date.now() - storedData.timestamp;
    const remaining = Math.max(0, storedData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string, patientId?: string): number {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const storedData = this.otpStore.get(sessionKey);
    if (!storedData) {
      return 0;
    }
    return Math.max(0, this.MAX_ATTEMPTS - storedData.attempts);
  }

  hasActiveOTPs(): boolean {
    return this.otpStore.size > 0;
  }

  clearOTPForPatient(phoneNumber: string, patientId?: string): void {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    this.otpStore.delete(sessionKey);
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
      patientId?: string;
    }
  > = new Map();
  private readonly MAX_ATTEMPTS = 3;

  private createSessionKey(phoneNumber: string, patientId?: string): string {
    // Create a composite key to allow multiple OTP sessions for the same phone number
    return patientId ? `${phoneNumber}::${patientId}` : phoneNumber;
  }

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    expiryMinutes: number = 5,
    nationalId: string | null = null,
    patientId?: string,
  ): Promise<void> {
    this.cleanupExpiredOTPs();

    const expiryTime = expiryMinutes * 60 * 1000;
    const sessionKey = this.createSessionKey(phoneNumber, patientId);

    try {
      const { id, message } = await requestOtpFromServer(phoneNumber, patientName, expiryMinutes, nationalId);

      const sessionData = {
        otpId: id,
        timestamp: Date.now(),
        attempts: 0,
        expiryTime,
        nationalId,
        phoneNumber,
        patientId,
      };

      this.otpSessions.set(sessionKey, sessionData);
    } catch (error) {
      this.otpSessions.delete(sessionKey);
      throw error;
    }
  }

  async verifyOTP(phoneNumber: string, inputOtp: string, patientId?: string): Promise<boolean> {
    this.cleanupExpiredOTPs();

    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const sessionData = this.otpSessions.get(sessionKey);

    if (!sessionData) {
      throw new OTPValidationError('No OTP session found for this phone number. Please request a new OTP.');
    }

    if (Date.now() - sessionData.timestamp > sessionData.expiryTime) {
      this.otpSessions.delete(sessionKey);
      throw new OTPValidationError('OTP has expired. Please request a new OTP.');
    }

    sessionData.attempts++;

    if (sessionData.attempts > this.MAX_ATTEMPTS) {
      this.otpSessions.delete(sessionKey);
      throw new OTPValidationError('Maximum OTP attempts exceeded. Please request a new OTP.');
    }

    try {
      const isValid = await verifyOtpWithServer(sessionData.otpId, inputOtp);

      if (isValid) {
        this.otpSessions.delete(sessionKey);
        return true;
      } else {
        this.otpSessions.set(sessionKey, sessionData);
        const remaining = this.MAX_ATTEMPTS - sessionData.attempts;
        throw new OTPValidationError(
          `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          remaining,
        );
      }
    } catch (error) {
      if (sessionData.attempts >= this.MAX_ATTEMPTS) {
        this.otpSessions.delete(sessionKey);
      } else {
        this.otpSessions.set(sessionKey, sessionData);
      }

      if (error instanceof OTPValidationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      const remainingAttempts = this.MAX_ATTEMPTS - sessionData.attempts;

      if (remainingAttempts > 0) {
        throw new OTPValidationError(
          `${errorMessage} ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          remainingAttempts,
        );
      } else {
        throw new OTPValidationError('Maximum OTP attempts exceeded. Please request a new OTP.');
      }
    }
  }

  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [sessionKey, data] of this.otpSessions.entries()) {
      if (now - data.timestamp > data.expiryTime) {
        this.otpSessions.delete(sessionKey);
      }
    }
  }

  hasValidOTP(phoneNumber: string, patientId?: string): boolean {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const sessionData = this.otpSessions.get(sessionKey);
    if (!sessionData) {
      return false;
    }
    return Date.now() - sessionData.timestamp <= sessionData.expiryTime;
  }

  getRemainingTimeMinutes(phoneNumber: string, patientId?: string): number {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const sessionData = this.otpSessions.get(sessionKey);
    if (!sessionData) {
      return 0;
    }
    const elapsed = Date.now() - sessionData.timestamp;
    const remaining = Math.max(0, sessionData.expiryTime - elapsed);
    return Math.ceil(remaining / (60 * 1000));
  }

  getRemainingAttempts(phoneNumber: string, patientId?: string): number {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    const sessionData = this.otpSessions.get(sessionKey);
    if (!sessionData) {
      return 0;
    }
    return Math.max(0, this.MAX_ATTEMPTS - sessionData.attempts);
  }

  hasActiveOTPs(): boolean {
    return this.otpSessions.size > 0;
  }

  clearOTPForPatient(phoneNumber: string, patientId?: string): void {
    const sessionKey = this.createSessionKey(phoneNumber, patientId);
    this.otpSessions.delete(sessionKey);
  }
}

interface IOTPManager {
  requestOTP(
    phoneNumber: string,
    patientName: string,
    expiryMinutes?: number,
    nationalId?: string | null,
    patientId?: string,
  ): Promise<void>;
  verifyOTP(phoneNumber: string, inputOtp: string, patientId?: string): Promise<boolean>;
  cleanupExpiredOTPs(): void;
  hasValidOTP(phoneNumber: string, patientId?: string): boolean;
  getRemainingTimeMinutes(phoneNumber: string, patientId?: string): number;
  getRemainingAttempts(phoneNumber: string, patientId?: string): number;
  hasActiveOTPs(): boolean;
  clearOTPForPatient?(phoneNumber: string, patientId?: string): void;
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
    if (source !== 'kehmis' && source !== 'hie') {
      throw new Error(`Invalid OTP source: ${source}. Must be 'kehmis' or 'hie'`);
    }
    this.currentSource = source;
  }

  getOtpSource(): string {
    return this.currentSource;
  }

  private getManager(): IOTPManager {
    if (this.currentSource === 'hie') {
      return this.hieManager;
    } else if (this.currentSource === 'kehmis') {
      return this.kehmisManager;
    } else {
      throw new Error(`Invalid OTP source: ${this.currentSource}`);
    }
  }

  async requestOTP(
    phoneNumber: string,
    patientName: string,
    expiryMinutes: number = 5,
    nationalId: string | null = null,
    patientId?: string,
  ): Promise<void> {
    this.cleanupExpiredOTPs();

    // Validate OTP source is set
    if (!this.currentSource) {
      throw new Error('OTP source not configured. Please contact your administrator.');
    }

    return this.getManager().requestOTP(phoneNumber, patientName, expiryMinutes, nationalId, patientId);
  }

  async verifyOTP(phoneNumber: string, inputOtp: string, patientId?: string): Promise<boolean> {
    this.cleanupExpiredOTPs();

    // Validate OTP source is set
    if (!this.currentSource) {
      throw new Error('OTP source not configured. Please contact your administrator.');
    }

    return this.getManager().verifyOTP(phoneNumber, inputOtp, patientId);
  }

  cleanupExpiredOTPs(): void {
    this.kehmisManager.cleanupExpiredOTPs();
    this.hieManager.cleanupExpiredOTPs();
  }

  hasValidOTP(phoneNumber: string, patientId?: string): boolean {
    return this.getManager().hasValidOTP(phoneNumber, patientId);
  }

  getRemainingTimeMinutes(phoneNumber: string, patientId?: string): number {
    return this.getManager().getRemainingTimeMinutes(phoneNumber, patientId);
  }

  getRemainingAttempts(phoneNumber: string, patientId?: string): number {
    return this.getManager().getRemainingAttempts(phoneNumber, patientId);
  }

  hasActiveOTPs(): boolean {
    return this.kehmisManager.hasActiveOTPs() || this.hieManager.hasActiveOTPs();
  }

  clearOTPForPatient(phoneNumber: string, patientId?: string): void {
    this.kehmisManager.clearOTPForPatient(phoneNumber, patientId);
    this.hieManager.clearOTPForPatient(phoneNumber, patientId);
  }
}

export const otpManager = new OTPManagerAdapter();

export const cleanupAllOTPs = (): void => {
  otpManager.cleanupExpiredOTPs();
};

export function createOtpHandlers(
  patientName: string,
  expiryMinutes: number,
  nationalId: string | null = null,
  otpSource?: string,
  patientId?: string,
) {
  if (otpSource) {
    otpManager.setOtpSource(otpSource);
  }

  return {
    onRequestOtp: async (phone: string): Promise<void> => {
      await otpManager.requestOTP(phone, patientName, expiryMinutes, nationalId, patientId);
    },
    onVerify: async (otp: string, phoneNumber: string): Promise<void> => {
      const isValid = await otpManager.verifyOTP(phoneNumber, otp, patientId);
      if (!isValid) {
        throw new OTPValidationError('OTP verification failed');
      }
    },
    hasValidOTP: (phone: string): boolean => {
      return otpManager.hasValidOTP(phone, patientId);
    },
    getRemainingTime: (phone: string): number => {
      return otpManager.getRemainingTimeMinutes(phone, patientId);
    },
    getRemainingAttempts: (phone: string): number => {
      return otpManager.getRemainingAttempts(phone, patientId);
    },
    cleanup: (): void => {
      otpManager.cleanupExpiredOTPs();
    },
  };
}

export { OTPNetworkError, OTPServerError, OTPParseError, OTPValidationError };
