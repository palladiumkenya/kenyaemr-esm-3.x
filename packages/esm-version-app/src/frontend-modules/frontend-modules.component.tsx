import React, { useMemo } from 'react';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { useTranslation } from 'react-i18next';

import { useFrontendModules } from '../hooks/useFrontendModules';

const FrontendModule: React.FC = () => {
  const { t } = useTranslation();
  const installedModules = useFrontendModules();

  const headers = [
    { key: 'name', header: t('moduleName', 'Module name') },
    { key: 'version', header: t('version', 'Version') },
  ];
  const rows = useMemo(
    () =>
      installedModules.map((module, index) => ({
        id: `module-${index}`,
        name: module.name,
        version: module.version ?? t('noVersionFound', 'No version found'),
      })),
    [installedModules, t],
  );

  return (
    <DataTable
      rows={rows}
      headers={headers}
      size="sm"
      useZebraStyles
      aria-label={t('frontendModules', 'Frontend modules')}>
      {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
        <Table {...getTableProps()}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow {...getRowProps({ row })}>
                {row.cells.map((cell) => (
                  <TableCell key={cell.id}>{cell.value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DataTable>
  );
};

export default FrontendModule;
