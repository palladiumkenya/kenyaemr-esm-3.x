import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTable,
  DataTableSkeleton,
  Pagination,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  OverflowMenu,
  OverflowMenuItem,
  Tile,
  DatePicker,
  DatePickerInput,
  TableToolbarContent,
  Section,
  Heading,
  Button,
} from '@carbon/react';
import { usePagination } from '@openmrs/esm-framework';
import { ArrowRight } from '@carbon/react/icons';

export const Discharged: React.FC = () => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const DischargedWorkListEntries = [
    // {
    //   id: 1,
    //   name: 'John Doe',
    //   'date-of-admission': '2024-03-20',
    //   'received-by': 'Admin',
    //   compartment: 'Cardiology',
    //   'body-type': 'Male',
    //   'date-of-death': '2024-03-21',
    // },
    // {
    //   id: 2,
    //   name: 'Jane Smith',
    //   'date-of-admission': '2024-03-21',
    //   'received-by': 'Doctor',
    //   'date-created': '2024-03-20',
    //   'body-type': 'Female',
    //   'date-of-death': '2024-03-23',
    // },
    // {
    //   id: 3,
    //   name: 'Alice Johnson',
    //   'date-of-admission': '2024-03-22',
    //   'received-by': 'Nurse',
    //   compartment: 'Orthopedics',
    //   'body-type': 'Female',
    //   'date-of-death': '2024-03-26',
    // },
    // {
    //   id: 4,
    //   name: 'Bob Brown',
    //   'date-of-admission': '2024-03-23',
    //   'received-by': 'Admin',
    //   compartment: 'Infectious Diseases',
    //   'body-type': 'Male',
    //   'date-of-death': '2024-03-29',
    // },
    // {
    //   id: 5,
    //   name: 'Eva Garcia',
    //   'date-of-admission': '2024-03-24',
    //   'received-by': 'Doctor',
    //   compartment: 'Allergy',
    //   'body-type': 'Female',
    //   'date-of-death': '2024-03-25',
    // },
    // {
    //   id: 6,
    //   name: 'Michael Lee',
    //   'date-of-admission': '2024-03-25',
    //   'received-by': 'Nurse',
    //   compartment: 'Gastroenterology',
    //   'body-type': 'Male',
    //   'date-of-death': '2024-03-27',
    // },
    // {
    //   id: 7,
    //   name: 'Sophia Martinez',
    //   'date-of-admission': '2024-03-26',
    //   'received-by': 'Admin',
    //   compartment: 'Plastic Surgery',
    //   'body-type': 'Female',
    //   'date-of-death': '2024-03-28',
    // },
    // {
    //   id: 8,
    //   name: 'William Wilson',
    //   'date-of-admission': '2024-03-27',
    //   'received-by': 'Doctor',
    //   compartment: 'Orthopedics',
    //   'body-type': 'Male',
    //   'date-of-death': '2024-03-30',
    // },
    // {
    //   id: 9,
    //   name: 'Olivia Taylor',
    //   'date-of-admission': '2024-03-28',
    //   'received-by': 'Nurse',
    //   compartment: 'Pulmonology',
    //   'body-type': 'Female',
    //   'date-of-death': '2024-03-31',
    // },
    // {
    //   id: 10,
    //   name: 'Daniel Anderson',
    //   'date-of-admission': '2024-03-29',
    //   'received-by': 'Admin',
    //   compartment: 'General Surgery',
    //   'body-type': 'Male',
    //   'date-of-death': '2024-04-02',
    // },
  ];

  const isLoading = false;

  const searchResults = DischargedWorkListEntries.filter(() => {
    return true; // No filtering applied for now
  });

  const { goTo, results: paginatedResults, currentPage } = usePagination(searchResults, currentPageSize);

  const pageSizes = [10, 20, 30, 40, 50];

  const rows = useMemo(() => {
    return paginatedResults.map((entry) => ({
      ...entry,
      action: (
        <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
          <OverflowMenuItem itemText="View Paid Bill" />
          <OverflowMenuItem itemText="Death Certificate" />
        </OverflowMenu>
      ),
    }));
  }, [paginatedResults]);

  const tableColumns = [
    {  header: t('id', 'IDENTIFIER'), key: 'id' },
    { id: 2, header: t('name', 'NAME'), key: 'name' },
    { id: 1, header: t('compartment', 'COMPARTMENT'), key: 'compartment' },
    {
      id: 3,
      header: t('date-of-admission', 'DATE OF ADMISSION'),
      key: 'date-of-admission',
    },
    {
      id: 4,
      header: t('date-of-death', 'DATE OF DEATH'),
      key: 'date-of-death',
    },
    { id: 5, header: t('received-by', 'RECEIVED BY'), key: 'received-by' },
    { id: 6, header: t('body-type', 'BODY TYPE'), key: 'body-type' },
    { id: 7, header: t('action', 'ACTION'), key: 'action' },
  ];
  const paid_bill_headers = [
    {
      key: 'service',
      header: 'Service Name',
    },
    {
      key: 'amount',
      header: 'Amount',
    },
  ];
  const amount_rows = [
    {
      id: '1',
      service: 'Clean Gloves',
      amount: '100.00',
    },
    {
      id: '2',
      service: 'Chamber charges',
      amount: '1000.00',
    },
  ];
  const toggleRowExpansion = (rowIndex: number) => {
    if (rows[rowIndex].action.props.children[0].props.itemText === 'View Paid Bill') {
      if (expandedRow === rowIndex) {
        setExpandedRow(null);
      } else {
        setExpandedRow(rowIndex);
      }
    }
  };

  return isLoading ? (
    <DataTableSkeleton />
  ) : (
    <div>
      <DataTable rows={rows} headers={tableColumns} useZebraStyles overflowMenuOnHover={true} isSortable>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
          <>
            <TableContainer {...getTableContainerProps()}>
              {' '}
              <TableToolbar
                style={{
                  position: 'static',
                  height: '1rem',
                  overflow: 'visible',
                  margin: 0,
                  // TODO: add background color to the toolbar
                }}>
                <TableToolbarContent style={{ margin: 0, position: 'relative' }}>
                  <TableToolbarSearch
                    style={{
                      backgroundColor: '#f4f4f4',
                      position: 'absolute',
                    }}
                  />
                  <DatePicker
                    datePickerType="single"
                    style={{
                      position: 'absolute',
                      right: '0',
                    }}>
                    <DatePickerInput
                      placeholder="mm/dd/yyyy"
                      id="date-picker-single"
                      size="md"
                      style={{ background: 'transparent' }}
                    />
                  </DatePicker>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} aria-label="discharge table">
                <TableHead>
                  <TableRow>
                    {headers.map((header, i) => (
                      <TableHeader
                        key={i}
                        {...getHeaderProps({
                          header,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      <TableRow
                        {...getRowProps({ row })}
                        onClick={() => toggleRowExpansion(rowIndex)}
                        style={{ cursor: 'pointer' }}>
                        {row.cells.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                      {expandedRow === rowIndex && (
                        <TableRow>
                          <TableCell colSpan={tableColumns.length}>
                            <Tile id="tile-1">
                              <Section level={5}>
                                <Heading>Deceased Information</Heading>
                                <br />
                                <Section>
                                  <Heading>Name: John Doe</Heading>
                                  <Heading>Gender: Male</Heading>
                                  <Heading>Cause of Death: Accident</Heading>
                                  <Heading>Tag Number: ABJK001</Heading>
                                  <Heading>Date of Admissiom: Accident</Heading>
                                </Section>
                                <br />
                                <Button
                                  kind="tertiary"
                                  renderIcon={(props) => <ArrowRight size={16} {...props} />}
                                  iconDescription={t('paid', 'paid bill')}>
                                  {t('paid-bill', 'Print Paid Bill')}
                                </Button>
                              </Section>
                              <br />
                              <br />

                              <Section level={5}>
                                <Heading>Bill Information</Heading>
                                <br />
                                <DataTable rows={amount_rows} headers={paid_bill_headers}>
                                  {({
                                    rows,
                                    headers,
                                    getHeaderProps,
                                    getRowProps,
                                    getTableProps,
                                    getTableContainerProps,
                                  }) => (
                                    <TableContainer
                                      {...getTableContainerProps()}
                                      style={{
                                        maxWidth: '50%',
                                        maxHeight: '800px',
                                      }}>
                                      <Table
                                        {...getTableProps()}
                                        aria-label="sample table"
                                        style={{ tableLayout: 'fixed' }}>
                                        <TableHead>
                                          <TableRow>
                                            {headers.map((header) => (
                                              <TableHeader
                                                key={header.key}
                                                {...getHeaderProps({
                                                  header,
                                                })}>
                                                {header.header}
                                              </TableHeader>
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
                              </Section>
                            </Tile>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={DischargedWorkListEntries.length}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setCurrentPageSize(pageSize);
                    goTo(1);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          </>
        )}
      </DataTable>
    </div>
  );
};
