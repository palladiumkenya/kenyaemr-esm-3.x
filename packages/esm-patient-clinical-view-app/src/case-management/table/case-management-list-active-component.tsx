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
  OverflowMenu,
  Tag,
  OverflowMenuItem,
} from '@carbon/react';
import { CardHeader, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import {
  ConfigurableLink,
  isDesktop,
  launchWorkspace,
  showModal,
  showSnackbar,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import styles from './case-management-list.scss';
import { useActivecases } from '../workspace/case-management.resource';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';

interface CaseManagementListActiveProps {
  setActiveCasesCount: (count: number) => void;
  activeTabIndex: number;
}

const CaseManagementListActive: React.FC<CaseManagementListActiveProps> = ({ setActiveCasesCount, activeTabIndex }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const responsiveSize = isDesktop(layout) ? 'lg' : 'sm';
  const { user } = useSession();
  const caseManagerPersonUuid = user?.person.uuid;

  const { data: activeCasesData } = useActivecases(caseManagerPersonUuid);

  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/case-management-encounters';

  const headers = [
    { key: 'names', header: t('names', 'Names') },
    { key: 'dateofstart', header: t('dateofstart', 'Start Date') },
    { key: 'dateofend', header: t('dateofend', 'End Date') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  const filteredCases = useMemo(
    () =>
      activeCasesData?.data.results.filter(
        (caseData) =>
          caseData.endDate === null &&
          (extractNameString(caseData.personB.display).toLowerCase().includes(searchTerm.toLowerCase()) ||
            caseData.personB.display.toLowerCase().includes(searchTerm.toLowerCase())),
      ) || [],
    [activeCasesData, searchTerm],
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
    dateofend: caseData.endDate ? (
      new Date(caseData.endDate).toLocaleDateString()
    ) : (
      <Tag type="green" size="lg">
        {t('enrolled', 'Enrolled')}
      </Tag>
    ),
    actions: (
      <OverflowMenu size="md">
        <OverflowMenuItem
          isDelete
          itemText={t('discontinue', 'Discontinue')}
          disabled={activeTabIndex === 1}
          onClick={() => handleDiscontinueACase(caseData.uuid)}
        />
      </OverflowMenu>
    ),
  }));

  const handleDiscontinueACase = async (relationshipUuid: string) => {
    launchWorkspace('end-relationship-form', {
      relationshipUuid,
    });
  };

  useEffect(() => {
    setActiveCasesCount(filteredCases.length);
  }, [filteredCases, setActiveCasesCount]);

  const headerTitle = `${t('activeCases', 'Active Cases')}`;

  if (!filteredCases.length) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>{t('noActiveCasesToDisplay', 'There is no active cases data to display.')}</p>
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

export default CaseManagementListActive;
