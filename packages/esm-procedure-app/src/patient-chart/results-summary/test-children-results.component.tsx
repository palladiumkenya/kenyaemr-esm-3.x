import React, { AnchorHTMLAttributes, useMemo } from 'react';
import { GroupMember, Value } from '../patient-procedure-order-results.resource';
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
  InlineLoading,
} from '@carbon/react';
import styles from './results-summary.scss';
import { useGetConceptById } from './results-summary.resource';

interface TestsResultsChildrenProps {
  members: GroupMember[];
}

interface ReferenceRangeProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  conceptUuid: string;
}

interface ColorRangeIndicatorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  value: number | Value;
  conceptUuid: string;
}

const TestResultsChildren: React.FC<TestsResultsChildrenProps> = ({ members }) => {
  const { t } = useTranslation();

  const columns = [
    { id: 1, header: t('test', 'Test'), key: 'test' },

    {
      id: 2,
      header: t('results', 'Results'),
      key: 'value',
    },
    {
      id: 3,
      header: t('range', 'Reference Range'),
      key: 'range',
    },
  ];

  const results = useMemo(() => {
    return members?.map((member) => ({
      id: member.uuid,
      test: {
        content: <span>{member?.concept?.display}</span>,
      },
      value: {
        content: <span>{typeof member?.value === 'number' ? member?.value : member?.display}</span>,
      },
    }));
  }, [members]);

  const ReferenceRange: React.FC<ReferenceRangeProps> = ({ conceptUuid }) => {
    const { concept: concept, isLoading, isError } = useGetConceptById(conceptUuid);

    if (isLoading) {
      return <TableCell>{<InlineLoading status="active" />}</TableCell>;
    }
    if (isError) {
      return <TableCell>{<span>Error</span>}</TableCell>;
    }
    return (
      <TableCell>
        {concept?.hiNormal === undefined || concept?.lowNormal === undefined ? (
          'N/A'
        ) : (
          <div>
            <span>{concept?.lowNormal}</span> : <span>{concept?.hiNormal}</span>
            <span style={{ marginLeft: '10px' }}>{concept?.units}</span>
          </div>
        )}
      </TableCell>
    );
  };

  const ColorRangeIndicator: React.FC<ColorRangeIndicatorProps> = ({ value, conceptUuid }) => {
    const { concept: concept, isLoading, isError } = useGetConceptById(conceptUuid);
    if (isLoading) {
      return <TableCell>{<InlineLoading status="active" />}</TableCell>;
    }

    if (isError) {
      return <TableCell>{<span>Error</span>}</TableCell>;
    }

    if (concept?.datatype?.display === 'coded') {
      return <TableCell>{typeof value === 'object' ? value?.display : value}</TableCell>;
    }

    let range = '';
    if (typeof value === 'number') {
      if (concept?.hiCritical && value >= concept?.hiCritical) {
        range = styles.criticallyHigh;
      }

      if (concept?.hiNormal && value > concept?.hiNormal) {
        range = styles.high;
      }

      if (concept?.lowCritical && value <= concept?.lowCritical) {
        range = styles.criticallyLow;
      }

      if (concept?.lowNormal && value < concept?.lowNormal) {
        range = styles.low;
      }
      return <TableCell className={range}>{value}</TableCell>;
    }
    return <TableCell>{value.display}</TableCell>;
  };

  if (results?.length >= 0) {
    return (
      <div>
        <DataTable rows={results} headers={columns} useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer className={styles.tableContainer}>
              <Table {...getTableProps()} className={styles.activePatientsTable}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow {...getRowProps({ row })}>
                          {row.cells.map((cell) =>
                            cell.info.header === 'range' ? (
                              <ReferenceRange conceptUuid={members[index]?.concept?.uuid}>
                                {cell.value?.content}
                              </ReferenceRange>
                            ) : cell.info.header === 'value' ? (
                              <ColorRangeIndicator
                                conceptUuid={members[index]?.concept.uuid}
                                value={members[index]?.value}
                              />
                            ) : (
                              <TableCell key={cell.id}>{cell.value?.content ?? cell?.value}</TableCell>
                            ),
                          )}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noTestOrdersToDisplay', 'No test orders to display')}</p>
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

export default TestResultsChildren;
