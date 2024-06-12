import React, { useMemo } from 'react';
import {
  DataTable,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableHeader,
  TableCell,
} from '@carbon/react';
import { age, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { convertToCurrency, extractString, getGender } from '../../helpers';
import { MappedBill } from '../../types';
import { useTranslation } from 'react-i18next';
import PrintableFooter from './printable-footer.component';
import PrintableInvoiceHeader from './printable-invoice-header.component';
import styles from './printable-invoice.scss';

type PrintableInvoiceProps = {
  bill: MappedBill;
  patient: fhir.Patient;
  isPrinting: boolean;
  facilityInfo: Record<string, any>;
};

const PrintableInvoice = React.forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ bill, patient, facilityInfo }, ref) => {
    const { t } = useTranslation();
    const headerData = [
      { header: 'Inventory item', key: 'billItem' },
      { header: 'Quantity', key: 'quantity' },
      { header: 'Unit price', key: 'price' },
      { header: 'Total', key: 'total' },
    ];

    const rowData =
      bill?.lineItems?.map((item, index) => {
        return {
          id: `${item.uuid}`,
          billItem: `${index + 1} - ${
            item.item === '' ? extractString(item?.billableService) : extractString(item.item)
          }`,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };
      }) ?? [];

    const invoiceTotal = {
      'Total Amount': convertToCurrency(bill?.totalAmount),
      'Amount Tendered': convertToCurrency(bill?.tenderedAmount),
      'Discount Amount': convertToCurrency(0),
      'Amount due': convertToCurrency(bill?.totalAmount - bill?.tenderedAmount),
    };

    const patientDetails = useMemo(() => {
      return {
        name: `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`,
        age: age(patient?.birthDate),
        gender: getGender(patient?.gender, t),
        city: patient?.address?.[0].city,
        county: patient?.address?.[0].district,
        subCounty: patient?.address?.[0].state,
      };
    }, [patient, t]);

    const invoiceDetails = {
      'Invoice #': bill.receiptNumber,
      'Invoice date': formatDatetime(parseDate(bill.dateCreated), { mode: 'standard', noToday: true }),
      Status: bill.status,
    };

    return (
      <div ref={ref} className={styles.container}>
        <PrintableInvoiceHeader patientDetails={patientDetails} facilityInfo={facilityInfo} />
        <div className={styles.printableInvoiceContainer}>
          <div className={styles.detailsContainer}>
            {Object.entries(invoiceDetails).map(([key, val]) => (
              <div key={key} className={styles.item}>
                <p className={styles.itemHeading}>{key}</p>
                <span className={styles.itemValue}>{val}</span>
              </div>
            ))}
          </div>

          <div className={styles.itemsContainer}>
            <div className={styles.tableContainer}>
              <DataTable size="sm" isSortable rows={rowData} headers={headerData} useZebraStyles>
                {({ rows, headers, getRowProps, getTableProps }) => (
                  <TableContainer>
                    <Table {...getTableProps()} aria-label="Invoice line items">
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader key={header.key}>{header.header}</TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                            key={row.id}
                            {...getRowProps({
                              row,
                            })}>
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            </div>

            <div className={styles.totalContainer}>
              {Object.entries(invoiceTotal).map(([key, val]) => (
                <p key={key} className={styles.itemTotal}>
                  <span className={styles.itemHeading}>{key}</span>: <span className={styles.itemLabel}>{val}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
        <PrintableFooter facilityInfo={facilityInfo} />
      </div>
    );
  },
);

export default PrintableInvoice;
