import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from '@carbon/react';
import styles from './results-summary.scss';
import TestResultsChildren from './test-children-results.component';
import { Ob } from '../patient-procedure-order-results.resource';

interface TestOrdersProps {
  obs: Ob[];
}

const TestsPrintResults: React.FC<TestOrdersProps> = ({ obs }) => {
  const { t } = useTranslation();

  const columns = [
    { id: 1, header: t('order', 'Order'), key: 'order' },
    { id: 2, header: t('results', 'Results'), key: 'result' },
  ];

  const filteredItems = obs.filter((ob) => ob?.order?.type === 'testorder' && ob?.groupMembers?.length > 0);

  const tableRows = useMemo(() => {
    return filteredItems?.map((entry) => ({
      ...entry,
      id: entry.uuid,
      members: entry?.groupMembers,
      order: {
        content: <span>{entry.display}</span>,
      },
      result: {
        content: <span>--</span>,
      },
    }));
  }, [filteredItems]);

  if (filteredItems?.length >= 0) {
    return (
      <div>
        <DataTable rows={tableRows} headers={columns} useZebraStyles expanded={false}>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer className={styles.tableContainer}>
              <Table {...getTableProps()} className={styles.activePatientsTable}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell?.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 2}>
                            {filteredItems[index]?.groupMembers !== null &&
                              filteredItems[index]?.groupMembers?.length > 0 && (
                                <TestResultsChildren members={filteredItems[index]?.groupMembers} />
                              )}
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noTestResultsToDisplay', 'No test results to display')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          )}
        </DataTable>
      </div>
    );
  }
};

export default TestsPrintResults;
