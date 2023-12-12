import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading } from '@carbon/react';
import { Printer } from '@carbon/react/icons';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { convertToCurrency } from '../helpers';
import { useBill } from '../billing.resource';
import { useParams } from 'react-router-dom';
import InvoiceTable from './invoice-table.component';
import Payments from './payments/payments.component';
import PrintableInvoice from './printable-invoice/printable-invoice.component';
import styles from './invoice.scss';

type InvoiceProps = {};

const Invoice: React.FC<InvoiceProps> = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { patient, patientUuid, isLoading } = usePatient(params?.patientUuid);
  const { bill, isLoading: isLoadingBilling, error } = useBill(params?.billUuid);
  const [isPrinting, setIsPrinting] = useState(false);
  const contentToPrintRef = useRef(null);
  const onBeforeGetContentResolve = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => contentToPrintRef.current,
    documentTitle: `Invoice ${bill?.receiptNumber} - ${patient?.name?.[0]?.given?.join(' ')} ${
      patient?.name?.[0].family
    }`,
    onBeforeGetContent: () =>
      new Promise((resolve) => {
        if (patient && bill) {
          onBeforeGetContentResolve.current = resolve;
          setIsPrinting(true);
        }
      }),
    onAfterPrint: () => {
      onBeforeGetContentResolve.current = null;
      setIsPrinting(false);
    },
  });

  useEffect(() => {
    if (isPrinting && onBeforeGetContentResolve.current) {
      onBeforeGetContentResolve.current();
    }
  }, [isPrinting]);

  const invoiceDetails = {
    'Total Amount': convertToCurrency(bill?.totalAmount),
    'Amount Tendered': convertToCurrency(bill?.tenderedAmount),
    'Invoice Number': bill.receiptNumber,
    'Date And Time': bill?.dateCreated,
    'Invoice Status': bill?.status,
  };

  if (isLoading && isLoadingBilling) {
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
        <div className={styles.buttonContainer}>
          <Button
            onClick={handlePrint}
            renderIcon={(props) => <Printer size={24} {...props} />}
            iconDescription="Print bill"
            size="md">
            {t('printBill', 'Print bill')}
          </Button>
        </div>
      </div>

      <InvoiceTable billUuid={bill?.uuid} />
      {bill && <Payments bill={bill} />}

      <div
        className={classNames({
          [styles.printContainer]: isPrinting !== true,
        })}
        ref={contentToPrintRef}>
        <PrintableInvoice bill={bill} patient={patient} isLoading={isLoading} />
      </div>
    </div>
  );
};

interface InvoiceDetailsProps {
  label: string;
  value: string | number;
}

function InvoiceDetails({ label, value }: InvoiceDetailsProps) {
  return (
    <div>
      <h1 className={styles.label}>{label}</h1>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default Invoice;
