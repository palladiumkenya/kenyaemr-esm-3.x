import React, { useMemo, useState } from 'react';
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
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { Ob } from '../patient-procedure-order-results.resource';

interface TestOrdersProps {
  obs: Ob[];
}

const TestsResults: React.FC<TestOrdersProps> = ({ obs }) => {
  const { t } = useTranslation();

  const columns = [
    { id: 0, header: t('order', 'Order'), key: 'order', align: 'center' },
    { id: 1, header: t('date', 'Date'), key: 'date' },
    { id: 2, header: t('result', 'Results'), key: 'result' },
  ];

  const formatDateColumn = (obsDatetime) => formatDate(parseDate(obsDatetime), { time: false });

  const obsList = obs?.filter((ob) => ob?.order?.type === 'testorder');

  const obsRows = useMemo(
    () =>
      obsList.map((ob, index) => ({
        id: ob.uuid,
        order: { content: <span>{ob?.concept?.display}</span> },
        date: { content: <span>{formatDateColumn(ob?.obsDatetime)}</span> },
        result: {
          content: <span>{ob[index]?.groupMembers === null ? ob?.display : ob?.value?.display}</span>,
        },
      })),
    [obsList],
  );

  return (
    <div>
      <DataTable rows={obsRows} headers={columns} useZebraStyles>
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
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded ? (
                      <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 2}>
                        {obsList[index]?.groupMembers !== null && obsList[index]?.groupMembers?.length > 0 && (
                          <TestResultsChildren members={obsList[index]?.groupMembers} />
                        )}
                      </TableExpandedRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noTestResultsToDisplay', 'No test results to display')}</p>
                  </div>
                </Tile>
              </div>
            )}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default TestsResults;
