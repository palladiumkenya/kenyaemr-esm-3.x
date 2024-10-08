import * as XLSX from 'xlsx';
import { ExcelFileRow, PaymentMethod } from '../../types';
import { ChargeAble } from './charge-summary.resource';
import { BillableFormSchema, ServicePriceSchema } from './form-schemas';

export type BillableServicePayload = {
  name: string;
  shortName: string;
  serviceType: number | string;
  servicePrices: Array<{
    paymentMode: string;
    price: string | number;
    name: string;
  }>;
  serviceStatus: string;
  concept: string | number;
  stockItem: string;
  uuid?: string;
};

export const formatBillableServicePayloadForSubmission = (
  formData: BillableFormSchema,
  uuid?: string,
): BillableServicePayload => {
  const formPayload = {
    name: formData.name,
    shortName: formData.name,
    serviceType: formData.serviceType.uuid,
    servicePrices: formData.servicePrices.map((servicePrice) => ({
      paymentMode: servicePrice.paymentMode.uuid,
      price: servicePrice.price.toFixed(2),
      name: servicePrice.paymentMode.name,
    })),
    serviceStatus: formData.serviceStatus,
    concept: formData.concept.concept.uuid,
    stockItem: formData?.stockItem ? formData.stockItem : '',
  };

  return uuid ? Object.assign(formPayload, { uuid: uuid }) : formPayload;
};

export function mapInputToPayloadSchema(service): BillableFormSchema {
  const servicePrices: ServicePriceSchema[] = service.servicePrices.map((price: any) => ({
    price: price.price,
    paymentMode: {
      uuid: price.paymentMode?.uuid,
      name: price.paymentMode?.name,
    },
  }));

  const payload: BillableFormSchema = {
    name: service.name,
    shortName: service.shortName,
    serviceType: {
      uuid: service?.serviceType?.uuid ?? '',
      display: service?.serviceType?.display ?? '',
    },
    servicePrices: servicePrices,
    serviceStatus: service.serviceStatus,
    concept: {
      concept: {
        uuid: service?.concept?.uuid,
        display: service.concept?.display,
      },
      conceptName: {
        uuid: service?.concept?.uuid,
        display: service?.concept?.display,
      },
      display: service?.concept?.display,
    },
  };

  return payload;
}

export const formatStockItemToPayload = (stockItem: any): BillableFormSchema => {
  return {
    name: stockItem.commonName,
    shortName: stockItem.commonName.length > 1 ? stockItem.commonName : `${stockItem.commonName} `,
    serviceType: {
      uuid: stockItem.serviceType?.uuid || '',
      display: stockItem.serviceType?.display || '',
    },
    servicePrices: [],
    concept: {
      concept: {
        uuid: stockItem.conceptUuid,
        display: stockItem.conceptName,
      },
      conceptName: {
        uuid: stockItem.conceptUuid,
        display: stockItem.conceptName,
      },
      display: stockItem.conceptName,
    },
    stockItem: stockItem.uuid,
  };
};

export const searchTableData = <T>(array: Array<T>, searchString: string) => {
  if (array !== undefined && array.length > 0) {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return array?.filter((item) =>
        Object.entries(item).some(([header, value]) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${value}`.toLowerCase().includes(search);
        }),
      );
    }
  }

  return array;
};

export const getBulkUploadPayloadFromExcelFile = (
  fileData: Uint8Array,
  currentlyExistingBillableServices: Array<ChargeAble>,
  paymentModes: Array<PaymentMethod>,
) => {
  const workbook = XLSX.read(fileData, { type: 'array' });

  let jsonData: Array<ExcelFileRow> = [];

  for (let i = 0; i < workbook.SheetNames.length; i++) {
    const sheetName = workbook.SheetNames[i];
    const worksheet = workbook.Sheets[sheetName];

    const sheetJSONData: Array<ExcelFileRow> = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    jsonData.push(...sheetJSONData);
  }

  if (jsonData.length === 0) {
    return [];
  }

  const firstRowKeys = Object.keys(jsonData.at(0));

  if (
    !firstRowKeys.includes('concept_id') ||
    !firstRowKeys.includes('name') ||
    !firstRowKeys.includes('price') ||
    !firstRowKeys.includes('disable') ||
    !firstRowKeys.includes('service_type_id') ||
    !firstRowKeys.includes('short_name')
  ) {
    return 'INVALID_TEMPLATE';
  }

  const rowsWithMissingCategories: Array<ExcelFileRow> = [];

  const payload = jsonData
    .filter((row) => {
      if (row.service_type_id.toString().length > 1) {
        return true;
      } else {
        rowsWithMissingCategories.push(row);
        return false;
      }
    })
    .filter(
      (row) => !currentlyExistingBillableServices.some((item) => item.name.toLowerCase() === row.name.toLowerCase()),
    )
    .map((row) => {
      return {
        name: row.name,
        shortName: row.short_name ?? row.name,
        serviceType: row.service_type_id,
        servicePrices: [
          {
            paymentMode: paymentModes.find((mode) => mode.name === 'Cash').uuid,
            price: row.price ?? 0,
            name: 'Cash',
          },
        ],
        serviceStatus: row.disable === 'false' ? 'DISABLED' : 'ENABLED',
        concept: row.concept_id,
        stockItem: '',
      };
    });

  return [payload, rowsWithMissingCategories];
};

export function createExcelTemplateFile(): Uint8Array {
  const headers = ['concept_id', 'name', 'short_name', 'price', 'disable', 'service_type_id'];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Charge Items');

  // Set column widths for better readability
  const colWidths = [
    { wch: 15 }, // concept_id
    { wch: 30 }, // name
    { wch: 20 }, // short_name
    { wch: 10 }, // price
    { wch: 10 }, // disable
    { wch: 20 }, // service_type_id
  ];
  worksheet['!cols'] = colWidths;

  // Generate the Excel file as a Uint8Array
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

export const downloadExcelTemplateFile = () => {
  const excelBuffer = createExcelTemplateFile();
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'charge_items_template.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
