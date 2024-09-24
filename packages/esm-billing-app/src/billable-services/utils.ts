import { mutate } from 'swr';
import * as XLSX from 'xlsx';
import { BillableServicePayload } from './billables/form-helper';

export const handleMutate = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, {
    revalidate: true,
  });
};

export const createAndDownloadFailedUploadsExcelFile = (data: BillableServicePayload[]) => {
  const worksheetData = data.map((item) => ({
    name: item.name,
    concept: item.concept,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'failed-billable-services.xlsx';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
