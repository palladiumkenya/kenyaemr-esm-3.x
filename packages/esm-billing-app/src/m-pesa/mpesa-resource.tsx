export type RequestStatus = 'INITIATED' | 'COMPLETE' | 'FAILED' | 'NOT-FOUND';

export const readableStatusMap = new Map<RequestStatus, string>();
readableStatusMap.set('COMPLETE', 'Complete');
readableStatusMap.set('FAILED', 'Failed');
readableStatusMap.set('INITIATED', 'Waiting for user...');
readableStatusMap.set('NOT-FOUND', 'Request not found');

export const MPESA_PAYMENT_API_BASE_URL = 'https://billing.kenyahmis.org';

export const initiateStkPush = async (
  payload,
  setNotification: (notification: { type: 'error' | 'success'; message: string }) => void,
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

    const response: { requestId: string } = await res.json();

    setNotification({ message: 'STK Push sent successfully', type: 'success' });
    return response.requestId;
  } catch (err) {
    console.error(err);
    setNotification({ message: 'Unable to initiate Lipa Na Mpesa, please try again later.', type: 'error' });
    throw err;
  }
};

export const getRequestStatus = async (requestId: string): Promise<RequestStatus> => {
  const requestResponse = await fetch(`${MPESA_PAYMENT_API_BASE_URL}/api/mpesa/check-payment-state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId,
    }),
  });

  const requestStatus: { status: RequestStatus } = await requestResponse.json();

  return requestStatus.status;
};
