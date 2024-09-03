import { BillableFormSchema, ServicePriceSchema } from './form-schemas';

export const formatBillableServicePayloadForSubmission = (formData: BillableFormSchema, uuid?: string) => {
  const formPayload = {
    name: formData.name,
    shortName: formData.name,
    serviceType: formData.serviceType.uuid,
    servicePrices: formData.servicePrices.map((servicePrice) => ({
      paymentMode: servicePrice.paymentMode.uuid,
      price: servicePrice.price,
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
      uuid: price.paymentMode.uuid,
      name: price.paymentMode.name,
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
        uuid: service.concept.uuid,
        display: service.concept.display,
      },
      conceptName: {
        uuid: service.concept.uuid,
        display: service.concept.display,
      },
      display: service.concept.display,
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
