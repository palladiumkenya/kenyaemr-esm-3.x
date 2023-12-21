import React from 'react';
import { TableRow, TableBody, OverflowMenu, OverflowMenuItem } from '@carbon/react';

type AdherenceTableProps = {
  encounterData: any[];
};

const AdherenceTable: React.FC<AdherenceTableProps> = ({ encounterData }) => {
  const uniqueDates = new Set();

  return (
    <>
      {encounterData.map(({ encounter }, index) => {
        const { obs = [] } = encounter ?? {};

        return (
          <table key={index}>
            <TableBody>
              {obs?.map((o, obsIndex) => {
                if (!uniqueDates.has(o?.obsDatetime) && o?.concept?.uuid === '1639AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
                  uniqueDates.add(o?.obsDatetime);
                  return (
                    <TableRow key={obsIndex}>
                      <td>{o?.obsDatetime.split('T')[0]}</td>
                      <td>{o?.value}</td>
                      <td>
                        <OverflowMenu ariaLabel="Actions" size="sm" flipped>
                          <OverflowMenuItem
                            hasDivider
                            //itemText={t('edit', 'Edit')}
                            // onClick={}
                          />
                        </OverflowMenu>
                      </td>
                    </TableRow>
                  );
                }
                return null;
              })}
            </TableBody>
          </table>
        );
      })}
    </>
  );
};

export default AdherenceTable;
