import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Search,
  Button,
  Layer,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { CardHeader, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { ConfigurableLink, isDesktop, useLayoutType, useSession } from '@openmrs/esm-framework';
import styles from './case-management-list.scss';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';
import { useActivecases, saveRelationship } from '../workspace/case-management.resource';

const CaseManagementListInActive: React.FC<{ setInactiveCasesCount: (count: number) => void }> = ({
  setInactiveCasesCount,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';
  const { user } = useSession();
  const caseManagerPersonUuid = user?.person.uuid;

  const { data: inactiveCasesData } = useActivecases(caseManagerPersonUuid);

  const headerTitle = t('inactiveCases', 'Inactive Cases');

  const headers = [
    { key: 'sno', header: t('s/No', 'S/No') },
    { key: 'names', header: t('names', 'Names') },
    // { key: 'reason', header: t('reason', 'Reason for assigned') },
    { key: 'dateofstart', header: t('dateofstart', 'Start Date') },
    { key: 'dateofend', header: t('dateofend', 'End Date') },
    // { key: 'notes', header: t('notes', 'Notes') },
    { key: 'action', header: t('action', 'Action') },
  ];

  const filteredCases = inactiveCasesData?.data.results.filter(
    (caseData) =>
      caseData.endDate !== null &&
      (extractNameString(caseData.personB.display).toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseData.personB.display.toLowerCase().includes(searchTerm.toLowerCase())),
  );
  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient%20Summary';

  const tableRows = filteredCases
    ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((caseData, index) => ({
      id: caseData.uuid,
      sno: (currentPage - 1) * pageSize + index + 1,
      names: (
        <ConfigurableLink
          style={{ textDecoration: 'none', maxWidth: '50%' }}
          to={patientChartUrl}
          templateParams={{ patientUuid: caseData.personB.uuid }}>
          {uppercaseText(extractNameString(caseData.personB.display))}
        </ConfigurableLink>
      ),
      // reason: t('assignedTo', 'Assigned to ') + caseData.personB.display,
      dateofstart: new Date(caseData.startDate).toLocaleDateString(),
      dateofend: new Date(caseData.endDate).toLocaleDateString(),
      // notes: '-',
      action: (
        <OverflowMenu flipped={document?.dir === 'rtl'} aria-label="overflow-menu">
          {/* <OverflowMenuItem itemText="Transfer Case" /> */}
        </OverflowMenu>
      ),
    }));

  useEffect(() => {
    setInactiveCasesCount(filteredCases?.length || 0);
  }, [filteredCases, setInactiveCasesCount]);

  if (filteredCases?.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('noContactToDisplay', 'There is no contact data to display for this patient.')}
          </p>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle} children={''}></CardHeader>
      <Search
        labelText=""
        placeholder={t('filterTable', 'Filter table')}
        size={responsiveSize}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows || []}
        headers={headers}
        render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={[5, 10, 15]}
        totalItems={filteredCases?.length || 0}
        onChange={({ page, pageSize }) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default CaseManagementListInActive;
