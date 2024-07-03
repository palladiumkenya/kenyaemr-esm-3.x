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
  Modal,
  Search,
} from '@carbon/react';
import { usePagination } from '@openmrs/esm-framework';
import { ArrowRight } from '@carbon/react/icons';

export const PharmacyUsers: React.FC = () => {
  const { t } = useTranslation();
  const [currentPageSize, setCurrentPageSize] = useState<number>(10);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const AdmittedWorkListEntries = [
    {
      id: 1,
      name: 'John Doe',
      'date-of-admission': '2024-03-20',
      cause: 'Heart Attack',
      'received-by': 'Admin',
      'date-created': '2024-03-19',
      compartment: 'Cardiology',
      'body-type': 'Male',
      'date-of-death': '2024-03-21',
    },
    {
      id: 2,
      name: 'Jane Smith',
      'date-of-admission': '2024-03-21',
      cause: 'Stroke',
      'received-by': 'Doctor',
      'date-created': '2024-03-20',
      compartment: 'Neurology',
      'body-type': 'Female',
      'date-of-death': '2024-03-23',
    },
    {
      id: 3,
      name: 'Alice Johnson',
      'date-of-admission': '2024-03-22',
      cause: 'Accident',
      'received-by': 'Nurse',
      'date-created': '2024-03-21',
      compartment: 'Orthopedics',
      'body-type': 'Female',
      'date-of-death': '2024-03-26',
    },
    {
      id: 4,
      name: 'Bob Brown',
      'date-of-admission': '2024-03-23',
      cause: 'Infection',
      'received-by': 'Admin',
      'date-created': '2024-03-22',
      compartment: 'Infectious Diseases',
      'body-type': 'Male',
      'date-of-death': '2024-03-29',
    },
    {
      id: 5,
      name: 'Eva Garcia',
      'date-of-admission': '2024-03-24',
      cause: 'Allergic Reaction',
      'received-by': 'Doctor',
      'date-created': '2024-03-23',
      compartment: 'Allergy',
      'body-type': 'Female',
      'date-of-death': '2024-03-25',
    },
    {
      id: 6,
      name: 'Michael Lee',
      'date-of-admission': '2024-03-25',
      cause: 'Food Poisoning',
      'received-by': 'Nurse',
      'date-created': '2024-03-24',
      compartment: 'Gastroenterology',
      'body-type': 'Male',
      'date-of-death': '2024-03-27',
    },
    {
      id: 7,
      name: 'Sophia Martinez',
      'date-of-admission': '2024-03-26',
      cause: 'Burn',
      'received-by': 'Admin',
      'date-created': '2024-03-25',
      compartment: 'Plastic Surgery',
      'body-type': 'Female',
      'date-of-death': '2024-03-28',
    },
    {
      id: 8,
      name: 'William Wilson',
      'date-of-admission': '2024-03-27',
      cause: 'Fracture',
      'received-by': 'Doctor',
      'date-created': '2024-03-26',
      compartment: 'Orthopedics',
      'body-type': 'Male',
      'date-of-death': '2024-03-30',
    },
    {
      id: 9,
      name: 'Olivia Taylor',
      'date-of-admission': '2024-03-28',
      cause: 'Pneumonia',
      'received-by': 'Nurse',
      'date-created': '2024-03-27',
      compartment: 'Pulmonology',
      'body-type': 'Female',
      'date-of-death': '2024-03-31',
    },
    {
      id: 10,
      name: 'Daniel Anderson',
      'date-of-admission': '2024-03-29',
      cause: 'Appendicitis',
      'received-by': 'Admin',
      'date-created': '2024-03-28',
      compartment: 'General Surgery',
      'body-type': 'Male',
      'date-of-death': '2024-04-02',
    },
  ];

  const isLoading = false;

  const searchResults = AdmittedWorkListEntries.filter(() => {
    return true; // No filtering applied for now
  });

  const { goTo, results: paginatedResults, currentPage } = usePagination(searchResults, currentPageSize);

  const pageSizes = [10, 20, 30, 40, 50];

  const rows = useMemo(() => {
    return paginatedResults.map((entry) => ({
      ...entry,
      action: (
        <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
          <OverflowMenuItem itemText="Add Bill" onClick={() => setIsModalOpen(true)} />
          <OverflowMenuItem hasDivider isDelete itemText="Request Discharge" />
        </OverflowMenu>
      ),
    }));
  }, [paginatedResults]);

  const tableColumns = [
    { id: 0, header: t('id', 'IDENTIFIER'), key: 'id' },
    { id: 1, header: t('compartment', 'COMPARTMENT'), key: 'compartment' },
    { id: 2, header: t('name', 'NAME'), key: 'name' },
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
  const pending_bill_headers = [
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
    if (rows[rowIndex].action.props.children[0].props.itemText === 'Add Bill') {
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
                  {/* <TableToolbarSearch
                    style={{
                      backgroundColor: '#f4f4f4',
                      position: 'absolute',
                    }}
                  />
                  <DatePicker
                    datePickerType="single"
                    style={{
                      position: 'absolute',
                      right: '0', // Align to the right edge
                    }}>
                    <DatePickerInput
                      placeholder="mm/dd/yyyy"
                      id="date-picker-single"
                      size="md"
                      style={{ background: 'transparent' }}
                    />
                  </DatePicker> */}
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} aria-label="sample table">
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
                                  iconDescription={t('pending', 'Pending Bills')}>
                                  {t('pending-bill', 'Send the Bill')}
                                </Button>
                                <br />
                              </Section>
                              <br />
                              <br />

                              <Section level={5}>
                                <Heading>Bill Information</Heading>
                                <br />
                                <DataTable rows={amount_rows} headers={pending_bill_headers}>
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
                totalItems={AdmittedWorkListEntries.length}
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
      <Modal
        primaryButtonText="ADD NEW BILL"
        secondaryButtonText="CANCEL"
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modalLabel="BILL MANAGEMENT"
        modalHeading="BILL"
        hasScrollingContent>
        <Search size="lg" placeholder="Search" labelText="Search" id={`search`} />
        <br />

        <Section level={5}>
          <Heading>Recently Added</Heading>
          <br />
          <Section></Section>
        </Section>
      </Modal>
      <style>
        {`
        .cds--toolbar-search-container-expandable {
            right: 19rem;
          }

        .cds--search-input:focus {
            outline: 2px solid #00473F;
          }

        .cds--toolbar-search-container-active.cds--search {
            width: 81.2%;
          }
  `}
      </style>
    </div>
  );
};
