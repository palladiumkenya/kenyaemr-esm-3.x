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

export const usePrintPreview = (url: string) => {
  const { data, isLoading, error, mutate } = useSWR<String>(url, fetcher);
  return { data, isLoading, error, mutate };
};
