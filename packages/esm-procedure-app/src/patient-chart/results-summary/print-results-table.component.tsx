import React from 'react';
import styles from './print-results-summary.scss';
import { GroupMember } from '../patient-procedure-order-results.resource';
import { useGetConceptById } from './results-summary.resource';
import { InlineLoading } from '@carbon/react';

interface PrintResultsTableProps {
  groupedResults: any[];
}

interface ResultsRowProps {
  groupMembers: GroupMember[];
}

interface ValueUnitsProps {
  conceptUuid: string;
}

const PrintResultsTable: React.FC<PrintResultsTableProps> = ({ groupedResults }) => {
  const RowTest: React.FC<ResultsRowProps> = ({ groupMembers }) => {
    // get Units
    const ValueUnits: React.FC<ValueUnitsProps> = ({ conceptUuid }) => {
      const { concept, isLoading, isError } = useGetConceptById(conceptUuid);

      if (isLoading) {
        return <InlineLoading status="active" />;
      }
      if (isError) {
        return <span>Error</span>;
      }

      return <span style={{ marginLeft: '10px' }}>{concept?.units ?? 'N/A'}</span>;
    };

    // get Reference Range
    const ReferenceRange: React.FC<ValueUnitsProps> = ({ conceptUuid }) => {
      const { concept, isLoading, isError } = useGetConceptById(conceptUuid);

      if (isLoading) {
        return <InlineLoading status="active" />;
      }
      if (isError) {
        return <span>Error</span>;
      }

      const lowNormal = concept?.lowNormal !== undefined ? concept.lowNormal : '--';
      const hiNormal = concept?.hiNormal !== undefined ? concept.hiNormal : '--';

      return (
        <>
          {concept?.hiNormal === undefined || concept?.lowNormal === undefined ? (
            'N/A'
          ) : (
            <div>
              <span>{lowNormal}</span> : <span>{hiNormal}</span>
            </div>
          )}
        </>
      );
    };

    return (
      <>
        {groupMembers?.map((element, index) => (
          <tr key={index}>
            <td>{element?.concept.display}</td>
            <td>{typeof element.value === 'object' ? element.value.display : element.value}</td>
            <td>
              <ReferenceRange conceptUuid={element.concept.uuid} />
            </td>
            <td>
              <ValueUnits conceptUuid={element.concept.uuid} />
            </td>
          </tr>
        ))}
      </>
    );
  };
  return (
    <section className={styles.section}>
      <table>
        <thead>
          <tr>
            <th>Tests</th>
            <th>Result</th>
            <th>Reference Range</th>
            <th>Units</th>
          </tr>
        </thead>
      </table>
      <table>
        <tbody>
          {Object.keys(groupedResults).map((test) => {
            const { uuid, groupMembers } = groupedResults[test];
            const isGrouped = uuid && groupMembers?.length > 0;
            return (
              <tr key={test} style={{ margin: '10px' }}>
                <span
                  style={{
                    margin: '10px',
                    fontSize: '8px',
                    fontWeight: 'bold',
                  }}>
                  {test}
                </span>
                <table style={{ margin: '10px' }}>
                  {isGrouped && <RowTest groupMembers={groupMembers} />}
                  {!isGrouped && (
                    <tr>
                      <td>
                        <span>{groupedResults[test]?.order?.display}</span>
                      </td>
                      <td>
                        <span>{groupedResults[test]?.value?.display}</span>
                      </td>
                      <td>
                        <span>{'N/A'}</span>
                      </td>
                      <td>
                        <span>{'N/A'}</span>
                      </td>
                    </tr>
                  )}{' '}
                </table>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export default PrintResultsTable;
