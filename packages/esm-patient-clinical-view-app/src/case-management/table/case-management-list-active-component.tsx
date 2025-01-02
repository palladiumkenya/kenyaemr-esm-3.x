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
  showSnackbar,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import styles from './case-management-list.scss';
import { useActivecases } from '../workspace/case-management.resource';
import { extractNameString, uppercaseText } from '../../utils/expression-helper';
import { updateRelationship } from '../../relationships/relationship.resources';

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

  const { data: activeCasesData, error: activeCasesError, mutate: fetchCases } = useActivecases(caseManagerPersonUuid);

  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/case-management-encounters';

  const headers = [
    { key: 'names', header: t('names', 'Names') },
    { key: 'dateofstart', header: t('dateofstart', 'Start Date') },
    { key: 'dateofend', header: t('dateofend', 'End Date') },
    { key: 'actions', header: t('actions', 'Actions') },
  ];

  const filteredCases = activeCasesData?.data.results.filter(
    (caseData) =>
      caseData.endDate === null &&
      (extractNameString(caseData.personB.display).toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseData.personB.display.toLowerCase().includes(searchTerm.toLowerCase())),
  );
  const handleDiscontinueACase = async (relationshipUuid: string) => {
    try {
      await updateRelationship(relationshipUuid, { endDate: new Date() });
      await fetchCases();

      showSnackbar({
        kind: 'success',
        title: t('endRlship', 'End relationship'),
        subtitle: t('savedRlship', 'Relationship ended successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('RlshipError', 'Relationship Error'),
        subtitle: t('RlshipError', 'Request Failed.......'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    }
  };

  const tableRows = filteredCases
    ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((caseData, index) => ({
      id: caseData.uuid,
      names: (
        <ConfigurableLink
          style={{ textDecoration: 'none', maxWidth: '50%' }}
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

  useEffect(() => {
    const count = filteredCases?.length || 0;
    setActiveCasesCount(count);
  }, [filteredCases, setActiveCasesCount]);

  const headerTitle = `${t('activeCases', 'Active Cases')}`;

  if (filteredCases?.length === 0) {
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

export default CaseManagementListActive;
