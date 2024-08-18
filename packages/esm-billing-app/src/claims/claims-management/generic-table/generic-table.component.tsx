import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  ContentSwitcher,
  Switch,
} from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import styles from './generic-table.scss';
import { Misuse, CheckmarkFilled, PendingFilled } from '@carbon/react/icons';

interface GenericClaimsDataTableProps {
  cardTitle: string;
  contentSwitcherTabs: { name: string; component: ReactNode }[];
  rows: any[];
  headers: any[];
  renderExpandedRow?: (row: any) => ReactNode;
  paginated?: boolean;
  pageSizes?: number[];
  currentPage?: number;
  goTo?: (page: number) => void;
  totalRows;
}

const GenericClaimsDataTable: React.FC<GenericClaimsDataTableProps> = ({
  cardTitle,
  contentSwitcherTabs,
  rows,
  headers,
  renderExpandedRow,
  paginated = true,
  pageSizes = [10, 20, 30],
  currentPage = 1,
  goTo,
  totalRows,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = React.useState(pageSizes[0]);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <div>
      <CardHeader title={t(cardTitle, cardTitle)}>
        <div className={styles.contentSwitcherWrapper}>
          <div className={styles.switcherContainer}>
            <ContentSwitcher
              className={styles.contentSwitcher}
              size="lg"
              selectedIndex={activeIndex}
              onChange={(event) => {
                setActiveIndex(event.index);
                contentSwitcherTabs[event.index];
              }}>
              {contentSwitcherTabs.map((tab, index) => (
                <Switch key={index} name={tab.name} text={tab.name} />
              ))}
            </ContentSwitcher>
          </div>
        </div>
      </CardHeader>
      <div className={styles.genericContainer}>
        <DataTable isSortable rows={rows} headers={headers} size={responsiveSize} useZebraStyles>
          {({
            rows,
            headers,
            getExpandHeaderProps,
            getTableProps,
            getTableContainerProps,
            getHeaderProps,
            getRowProps,
          }) => (
            <TableContainer {...getTableContainerProps()}>
              <Table className={styles.table} {...getTableProps()} aria-label="Bill list">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader key={i} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'status' && (
                              <div className={styles.statusIconWrapper}>
                                {cell.value === 'Fulfilled' || cell.value === 'Approved' ? (
                                  <>
                                    <CheckmarkFilled aria-label="Fulfilled" className={styles.statusSuccessIcon} />
                                    {cell.value}
                                  </>
                                ) : cell.value === 'Pending' ? (
                                  <>
                                    <PendingFilled aria-label="Pending" className={styles.statusPendingIcon} />{' '}
                                    {cell.value}
                                  </>
                                ) : (
                                  <>
                                    <Misuse aria-label="Rejected or Unfulfilled" className={styles.statusWarningIcon} />
                                    {cell.value}
                                  </>
                                )}
                              </div>
                            )}
                            {cell.info.header !== 'status' && cell.value} {/* Render the value for non-status cells */}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                          {renderExpandedRow ? renderExpandedRow(row) : null}
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 1} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        {paginated && (
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={totalRows}
            className={styles.pagination}
            size={responsiveSize}
            onChange={({ page: newPage, pageSize }) => {
              if (newPage !== currentPage) {
                goTo?.(newPage);
              }
              setPageSize(pageSize);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GenericClaimsDataTable;
