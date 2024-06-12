import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, usePatient, showModal, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { convertToCurrency } from '../helpers';
import { LineItem } from '../types';
import { useBill, useDefaultFacility } from '../billing.resource';
import InvoiceTable from './invoice-table.component';
import Payments from './payments/payments.component';
import PrintReceipt from './printable-invoice/print-receipt.component';
import PrintableInvoice from './printable-invoice/printable-invoice.component';
import styles from './invoice.scss';
import MakeClaims from './claims/make-claims.component';

interface InvoiceDetailsProps {
  label: string;
  value: string | number;
}

const Invoice: React.FC = () => {
  const { t } = useTranslation();
  const { data: facilityInfo } = useDefaultFacility();
  const { billUuid, patientUuid } = useParams();
  const [isPrinting, setIsPrinting] = useState(false);
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);
  const { bill, isLoading: isLoadingBill, error } = useBill(billUuid);
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const handleSelectItem = (lineItems: Array<LineItem>) => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    setSelectedLineItems([...lineItems, ...paidLineItems]);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice ${bill?.receiptNumber} - ${patient?.name?.[0]?.given?.join(' ')} ${
      patient?.name?.[0].family
    }`,
    onBeforePrint() {
      setIsPrinting(true);
    },
    onAfterPrint() {
      setIsPrinting(false);
    },
    removeAfterPrint: true,
  });

  const handleBillPayment = () => {
    const dispose = showModal('initiate-payment-modal', {
      closeModal: () => dispose(),
      bill: bill,
    });
  };

  useEffect(() => {
    const paidLineItems = bill?.lineItems?.filter((item) => item.paymentStatus === 'PAID') ?? [];
    setSelectedLineItems(paidLineItems);
  }, [bill.lineItems]);

  const invoiceDetails = {
    'Total Amount': convertToCurrency(bill?.totalAmount),
    'Amount Tendered': convertToCurrency(bill?.tenderedAmount),
    'Invoice Number': bill.receiptNumber,
    'Date And Time': formatDatetime(parseDate(bill.dateCreated), { mode: 'standard', noToday: true }),
    'Invoice Status': bill?.status,
  };

  if (isLoadingPatient && isLoadingBill) {
    return (
      <div className={styles.invoiceContainer}>
        <InlineLoading
          className={styles.loader}
          status="active"
          iconDescription="Loading"
          description="Loading patient header..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState headerTitle={t('invoiceError', 'Invoice error')} error={error} />
      </div>
    );
  }

  return (
    <div className={styles.invoiceContainer}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <div className={styles.detailsContainer}>
        <section className={styles.details}>
          {Object.entries(invoiceDetails).map(([key, val]) => (
            <InvoiceDetails key={key} label={key} value={val} />
          ))}
        </section>
        <div>
          <Button onClick={handleBillPayment} iconDescription="Initiate Payment" size="md">
            {t('initiatePayment', 'Initiate Payment')}
          </Button>
          <Button
            disabled={isPrinting}
            onClick={handlePrint}
            renderIcon={(props) => <Printer size={24} {...props} />}
            iconDescription="Print bill"
            className={styles.button}
            size="md">
            {isPrinting ? t('printing', 'Printing...') : t('printBill', 'Print bill')}
          </Button>
          {/* {bill.status === 'PAID' ? <PrintReceipt billId={bill?.id} /> : null} */}
          <MakeClaims />
        </div>
      </div>

      <InvoiceTable bill={bill} isLoadingBill={isLoadingBill} onSelectItem={handleSelectItem} />
      <Payments bill={bill} selectedLineItems={selectedLineItems} />

      <div className={styles.printContainer}>
        <PrintableInvoice
          ref={componentRef}
          facilityInfo={facilityInfo}
          bill={bill}
          patient={patient}
          isPrinting={isPrinting}
        />
      </div>
    </div>
  );
};

function InvoiceDetails({ label, value }: InvoiceDetailsProps) {
  return (
    <div>
      <h1 className={styles.label}>{label}</h1>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default Invoice;
