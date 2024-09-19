import React from 'react';
import BillingHeader from '../../billing-header/billing-header.component';
import { useParams } from 'react-router-dom';
import { usePaymentPoints } from '../payment-points.resource';

export const PaymentPoint = () => {
  const { paymentPointUUID } = useParams();
  const { paymentPoints, isLoading, error } = usePaymentPoints();

  const paymentPoint = paymentPoints?.find((point) => point.uuid === paymentPointUUID);

  if (isLoading) {
    return <p>loading</p>;
  }

  return (
    <div>
      <BillingHeader title={`Payment Points / ${paymentPoint.name}`} />
    </div>
  );
};
