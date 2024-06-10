import React from 'react';
import { convertToCurrency } from '../../helpers';
import { useBillableItem } from './useBilliableItem';

type LabOrderProps = {
  order: {
    testType?: {
      label: string;
      conceptUuid: string;
    };
  };
};

const LabOrder: React.FC<LabOrderProps> = ({ order }) => {
  // TODO: Implement logic to display whether the lab order service is available to ensure clinicians can order the service

  const { billableItem, error, isLoading } = useBillableItem(order?.testType?.conceptUuid);

  const billItems = billableItem?.servicePrices
    .map((servicePrice) => `${servicePrice?.paymentMode?.name} - ${convertToCurrency(servicePrice?.price)}`)
    .join(' ');

  if (isLoading) {
    return null;
  }

  if (error) {
    return null;
  }

  return <p>{billItems}</p>;
};

export default LabOrder;
