import React, { useState, useEffect, useMemo } from 'react';
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
  Layer,
  Tile,
  Tag,
} from '@carbon/react';
import { CardHeader, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { ConfigurableLink, isDesktop, useLayoutType, useSession } from '@openmrs/esm-framework';
import styles from './case-management-list.scss';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';
import { useActivecases } from '../workspace/case-management.resource';

interface CaseManagementListInActiveProps {
  setInactiveCasesCount: (count: number) => void;
}

const CaseManagementListInActive: React.FC<CaseManagementListInActiveProps> = ({ setInactiveCasesCount }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';
  const { user } = useSession();
  const caseManagerPersonUuid = user?.person.uuid;

  const { data: inactiveCasesData } = useActivecases(caseManagerPersonUuid);

  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/case-management-encounters';

  const headers = [
    { key: 'names', header: t('names', 'Names') },
    { key: 'dateofstart', header: t('dateofstart', 'Start Date') },
    { key: 'dateofend', header: t('dateofend', 'End Date') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const filteredCases = useMemo(
    () =>
      inactiveCasesData?.data.results.filter(
        (caseData) =>
          caseData.endDate !== null &&
          (extractNameString(caseData.personB.display).toLowerCase().includes(searchTerm.toLowerCase()) ||
            caseData.personB.display.toLowerCase().includes(searchTerm.toLowerCase())),
      ) || [],
    [inactiveCasesData, searchTerm],
  );

  const paginatedCases = useMemo(
    () => filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCases, currentPage, pageSize],
  );

  const tableRows = paginatedCases.map((caseData) => ({
    id: caseData.uuid,
    names: (
      <ConfigurableLink
        className={styles.configurableLink}
        to={patientChartUrl}
        templateParams={{ patientUuid: caseData.personB.uuid }}>
        {uppercaseText(extractNameString(caseData.personB.display))}
      </ConfigurableLink>
    ),
    dateofstart: new Date(caseData.startDate).toLocaleDateString(),
    dateofend: new Date(caseData.endDate).toLocaleDateString(),
    status: caseData.endDate ? (
      <Tag type="red" size="lg">
        {t('discontinued', 'Discontinued')}
      </Tag>
    ) : (
      '--'
    ),
  }));

  useEffect(() => {
    setInactiveCasesCount(filteredCases.length);
  }, [filteredCases, setInactiveCasesCount]);

  const headerTitle = `${t('inactiveCases', 'Inactive Cases')}`;

  if (!filteredCases.length) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t('noInActiveCasesToDisplay', 'There is no inactive cases data to display.')}
          </p>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle} children={''} />
      <Search
        labelText=""
        placeholder={t('filterTable', 'Filter table')}
        size={responsiveSize}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows}
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
        totalItems={filteredCases.length}
        onChange={({ page, pageSize }) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default CaseManagementListInActive;
