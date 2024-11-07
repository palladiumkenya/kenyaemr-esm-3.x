import { RequestStatus } from '../types';

export const readableStatusMap = new Map<RequestStatus, string>();
readableStatusMap.set('COMPLETE', 'Complete');
readableStatusMap.set('FAILED', 'Failed');
readableStatusMap.set('INITIATED', 'Waiting for user...');
readableStatusMap.set('NOT-FOUND', 'Request not found');

export const initiateStkPush = async (
  payload: {
    AccountReference: string;
    PhoneNumber: string;
    Amount: string;
  },
  setNotification: (notification: { type: 'error' | 'success'; message: string }) => void,
  MPESA_PAYMENT_API_BASE_URL: string,
): Promise<string> => {
  try {
    const url = `${MPESA_PAYMENT_API_BASE_URL}/api/mpesa/stk-push`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: payload.PhoneNumber,
        amount: payload.Amount,
        accountReference: payload.AccountReference,
      }),
    });

    if (res.ok) {
      const response: { requestId: string } = await res.json();
      setNotification({ message: 'STK Push sent successfully', type: 'success' });
      return response.requestId;
    }

    if (!res.ok && res.status === 403) {
      setNotification({
        message: 'Health facility M-PESA data not configured.',
        type: 'error',
      });

      return;
    }

    if (!res.ok) {
      throw new Error('Unable to initiate Lipa Na Mpesa, please try again later.');
    }
  } catch (err) {
    setNotification({
      message: 'Unable to initiate Lipa Na Mpesa, please try again later.',
      type: 'error',
    });
  }
};

export const getRequestStatus = async (
  requestId: string,
  MPESA_PAYMENT_API_BASE_URL: string,
): Promise<{ status: RequestStatus; referenceCode?: string }> => {
  const requestResponse = await fetch(`${MPESA_PAYMENT_API_BASE_URL}/api/mpesa/check-payment-state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId,
    }),
  });

  if (!requestResponse.ok) {
    const error = new Error(`HTTP error! status: ${requestResponse.status}`);

    if (requestResponse.statusText) {
      error.message = requestResponse.statusText;
    }
    throw error;
  }

  const requestStatus: { status: RequestStatus; referenceCode?: string } = await requestResponse.json();

  return requestStatus;
};

export const getErrorMessage = (err: { message: string }, t) => {
  if (err.message) {
    return err.message;
  }

  return t('unKnownErrorMsg', 'An unknown error occurred');
};
