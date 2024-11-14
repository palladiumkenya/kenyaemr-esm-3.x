import { restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
  const fileData = await res.arrayBuffer();
  const blob = new Blob([fileData], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

export const usePaidBillReceiptFileObjectUrl = (billId: number) => {
  const url = `/openmrs${restBaseUrl}/cashier/receipt?billId=${billId}`;
  const { data, isLoading, error, mutate } = useSWR<String>(url, fetcher);
  return { url: data, isLoading, error, mutate };
};
