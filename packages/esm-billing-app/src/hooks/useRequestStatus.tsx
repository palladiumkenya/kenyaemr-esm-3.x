import { useState, useEffect, SetStateAction } from 'react';
import { RequestStatus, getRequestStatus, readableStatusMap, getErrorMessage } from '../m-pesa/mpesa-resource';
import { useTranslation } from 'react-i18next';

type RequestData = { requestId: string; requestStatus: RequestStatus | null };

export const useRequestStatus = (
  setNotification: React.Dispatch<SetStateAction<{ type: 'error' | 'success'; message: string } | null>>,
): [RequestData | null, React.Dispatch<React.SetStateAction<RequestData | null>>] => {
  const { t } = useTranslation();

  const [requestData, setRequestData] = useState<{ requestId: string; requestStatus: RequestStatus | null }>({
    requestId: null,
    requestStatus: null,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (requestData.requestId && !['COMPLETE', 'FAILED', 'NOT-FOUND'].includes(requestData.requestStatus)) {
      const fetchStatus = async () => {
        try {
          const status = await getRequestStatus(requestData.requestId);
          if (status === 'COMPLETE' || status === 'FAILED' || status === 'NOT-FOUND') {
            clearInterval(interval);
          }
          if (status === 'COMPLETE' || status === 'INITIATED') {
            setNotification({ type: 'success', message: readableStatusMap.get(status) });
          }
          if (status === 'FAILED' || status === 'NOT-FOUND') {
            setNotification({ type: 'error', message: readableStatusMap.get(status) });
          }
        } catch (error) {
          clearInterval(interval);
          setNotification({ type: 'error', message: getErrorMessage(error, t) });
        }
      };

      interval = setInterval(fetchStatus, 2000);

      return () => clearInterval(interval);
    }
  }, [requestData.requestId, requestData.requestStatus, setNotification, t]);

  return [requestData, setRequestData];
};
