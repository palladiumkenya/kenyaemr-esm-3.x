import * as XLSX from 'xlsx';
import { ExcelFileRow, PaymentMethod, PaymentMode, ServiceType } from '../../types';
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
  const servicePrices: Array<ServicePriceSchema> = service.servicePrices.map((price: any) => ({
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
  serviceTypes: Array<ServiceType>,
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
    !firstRowKeys.includes('name') ||
    !firstRowKeys.includes('short_name') ||
    !firstRowKeys.includes('service_status') ||
    !firstRowKeys.includes('service_type_id') ||
    !firstRowKeys.includes('concept_id')
  ) {
    return 'INVALID_TEMPLATE';
  }

  const newChargeItems = [];
  const updatedChargeItems = [];

  for (const chargeItem of jsonData) {
    const alreadyExists = !currentlyExistingBillableServices.some(
      (item) => item.name.toLowerCase() === chargeItem.name.toLowerCase(),
    );

    if (alreadyExists) {
      newChargeItems.push(chargeItem);
    } else {
      updatedChargeItems.push(chargeItem);
    }
  }

  const constructPayload = (chargeItems: ExcelFileRow[]) => {
    return chargeItems.map((row) => {
      const servicePrices = paymentModes
        .map((mode) => {
          if (row[mode.name].toString().length > 1) {
            return {
              paymentMode: mode.uuid,
              price: row[mode.name],
              name: mode.name,
            };
          }
        })
        .filter((priceObj) => Boolean(priceObj));

      return {
        name: row.name,
        shortName: row.short_name ?? row.name,
        serviceType: serviceTypes.find((type) => type.id === row.service_type_id)?.uuid ?? null,
        servicePrices,
        serviceStatus: row.service_status,
        concept: row.concept_id,
      };
    });
  };

  const newChargeItemsPayload = constructPayload(newChargeItems);
  const updatedChargeItemsPayload = constructPayload(updatedChargeItems);

  return [newChargeItemsPayload, updatedChargeItemsPayload];
};

export function createExcelTemplateFile(paymentModes: PaymentMode[]): Uint8Array {
  const headers = [
    'name',
    'short_name',
    'service_status',
    'service_type_id',
    'concept_id',
    ...paymentModes.map((mode) => mode.name),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Charge Items');

  // Set column widths for better readability
  const colWidths = [
    { wch: 30 }, // name
    { wch: 20 }, // short_name
    { wch: 10 }, // service_status
    { wch: 20 }, // service_type_id
    { wch: 15 }, // concept_id
    ...paymentModes.map(() => {
      return {
        wch: 10,
      };
    }),
  ];
  worksheet['!cols'] = colWidths;

  // Generate the Excel file as a Uint8Array
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

export const downloadExcelTemplateFile = (paymentModes: PaymentMode[]) => {
  const excelBuffer = createExcelTemplateFile(paymentModes);
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
