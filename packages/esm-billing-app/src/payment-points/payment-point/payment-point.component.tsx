import React from 'react';
import BillingHeader from '../../billing-header/billing-header.component';
import { useParams } from 'react-router-dom';
import { usePaymentPoints } from '../payment-points.resource';
import { PaymentHistoryViewer } from '../../billable-services/payment-history/payment-history-viewer.component';

export const headers = [
  { header: 'Date', key: 'dateCreated' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'Total Amount', key: 'totalAmount' },
  { header: 'Service', key: 'billingService' },
];

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
      <PaymentHistoryViewer />
    </div>
  );
};
