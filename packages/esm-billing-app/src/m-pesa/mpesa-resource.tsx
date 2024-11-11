import { PDSLIntegrationCredential, RequestStatus } from '../types';

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
  isPDSLFacility: boolean,
  pdslCredentials: PDSLIntegrationCredential,
  updatePDSLtoken: (token: string) => void,
): Promise<string> => {
  if (isPDSLFacility) {
    const url = `${MPESA_PAYMENT_API_BASE_URL}/api/login`;

    const formData = new FormData();
    formData.append('email', pdslCredentials.email);
    formData.append('password', pdslCredentials.password);

    const loginResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (loginResponse.ok) {
      const response: { token: string; api_token: string; expires_at: string } = await loginResponse.json();
      const billReference = payload.AccountReference.split('#').at(-1);
      const stkPushURL = `${MPESA_PAYMENT_API_BASE_URL}/api/stk-push?bill_reference=${billReference}&amount=${payload.Amount}&msisdn=${payload.PhoneNumber}`;

      const stkPushResponse = await fetch(stkPushURL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${response.token}`,
        },
      });

      updatePDSLtoken(response.token);

      if (stkPushResponse.ok) {
        const response: { requestId: string } = await stkPushResponse.json();
        setNotification({ message: 'STK Push sent successfully', type: 'success' });
        return response.requestId;
      }

      if (!stkPushResponse.ok) {
        setNotification({
          message: 'An error occurred making the request',
          type: 'error',
        });

        return;
      }
    }

    if (!loginResponse.ok) {
      setNotification({
        message: 'An error occurred making the request',
        type: 'error',
      });

      return;
    }
  } else {
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
  }
};

export const getRequestStatus = async (
  requestId: string,
  MPESA_PAYMENT_API_BASE_URL: string,
  isPDSLFacility: boolean,
  pdslToken: string | null,
): Promise<{ status: RequestStatus; referenceCode?: string }> => {
  let response: Response;

  if (isPDSLFacility) {
    response = await fetch(`${MPESA_PAYMENT_API_BASE_URL}/api/stk-push-query?requestId=${requestId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pdslToken}`,
      },
    });
  } else {
    response = await fetch(`${MPESA_PAYMENT_API_BASE_URL}/api/mpesa/check-payment-state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
      }),
    });
  }

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);

    if (response.statusText) {
      error.message = response.statusText;
    }
    throw error;
  }

  const requestStatus: { status: RequestStatus; referenceCode?: string } = await response.json();

  return requestStatus;
};

export const getErrorMessage = (err: { message: string }, t) => {
  if (err.message) {
    return err.message;
  }

  return t('unKnownErrorMsg', 'An unknown error occurred');
};
