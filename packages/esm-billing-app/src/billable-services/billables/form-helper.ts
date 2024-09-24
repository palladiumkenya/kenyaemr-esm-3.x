import * as XLSX from 'xlsx';
import { PaymentMethod } from '../../types';
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
  currentlyExistingBillableServices: ChargeAble[],
  paymentModes: PaymentMethod[],
) => {
  const workbook = XLSX.read(fileData, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const jsonData: {
    concept_id: number;
    name: string;
    price: number;
    disable: 'false' | 'true';
    category: number;
  }[] = XLSX.utils.sheet_to_json(worksheet);

  const payload = jsonData
    .filter((row) => row.category)
    .filter(
      (row) => !currentlyExistingBillableServices.some((item) => item.name.toLowerCase() === row.name.toLowerCase()),
    )
    .map((row) => {
      return {
        name: row.name,
        shortName: row.name,
        serviceType: row.category,
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

  return payload;
};
