export type RequestStatus = 'INITIATED' | 'COMPLETE' | 'FAILED' | 'NOT-FOUND';

export const readableStatusMap = new Map<RequestStatus, string>();
readableStatusMap.set('COMPLETE', 'Complete');
readableStatusMap.set('FAILED', 'Failed');
readableStatusMap.set('INITIATED', 'Waiting for user...');
readableStatusMap.set('NOT-FOUND', 'Request not found');

export const initiateStkPush = async (
  payload,
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

    if (!res.ok && res.status === 403) {
      const error = new Error('Health facility M-PESA data not configured.');
      throw error;
    }

    const response: { requestId: string } = await res.json();

    setNotification({ message: 'STK Push sent successfully', type: 'success' });
    return response.requestId;
  } catch (err) {
    const error = err as Error;
    setNotification({
      message: error.message ?? 'Unable to initiate Lipa Na Mpesa, please try again later.',
      type: 'error',
    });
  }
};

export const getRequestStatus = async (
  requestId: string,
  MPESA_PAYMENT_API_BASE_URL: string,
): Promise<RequestStatus> => {
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

  const requestStatus: { status: RequestStatus } = await requestResponse.json();

  return requestStatus.status;
};

export const getErrorMessage = (err: { message: string }, t) => {
  if (err.message) {
    return err.message;
  }

  return t('unKnownErrorMsg', 'An unknown error occurred');
};
