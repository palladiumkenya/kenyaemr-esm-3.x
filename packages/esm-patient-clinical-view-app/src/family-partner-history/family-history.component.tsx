import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Button,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { EmptyDataIllustration, ErrorState, CardHeader, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import {
  ConfigurableLink,
  isDesktop,
  launchWorkspace,
  useConfig,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { usePatientRelationships } from './relationships.resource';
import ConceptObservations from './concept-obs.component';
import type { ConfigObject } from '../config-schema';
import styles from './family-history.scss';

interface FamilyHistoryProps {
  patientUuid: string;
}

const FamilyHistory: React.FC<FamilyHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { concepts, familyRelationshipsTypeList } = config;
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const { relationships, error, isLoading, isValidating } = usePatientRelationships(patientUuid);

  const familyRelationshipTypeUUIDs = new Set(familyRelationshipsTypeList.map((type) => type.uuid));
  const familyRelationships = relationships.filter((r) => familyRelationshipTypeUUIDs.has(r.relationshipTypeUUID));

  const headerTitle = t('familyContacts', 'Family contacts');
  const { results, totalPages, currentPage, goTo } = usePagination(familyRelationships, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  const headers = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('relation', 'Relation'),
      key: 'relation',
    },
    {
      header: t('age', 'Age'),
      key: 'age',
    },
    {
      header: t('alive', 'Alive'),
      key: 'alive',
    },
    {
      header: t('causeOfDeath', 'Cause of Death'),
      key: 'causeOfDeath',
    },
    {
      header: t('chronicDisease', 'Chronic Disease'),
      key: 'chronicDisease',
    },
  ];

  const handleAddHistory = () => {
    launchWorkspace('family-relationship-form', {
      workspaceTitle: 'Family Relationship Form',
      rootPersonUuid: patientUuid,
    });
  };

  const tableRows =
    results?.map((relation) => {
      const patientUuid = relation.patientUuid;

      return {
        id: `${relation.uuid}`,
        name: (
          <ConfigurableLink
            style={{ textDecoration: 'none' }}
            to={window.getOpenmrsSpaBase() + `patient/${relation.relativeUuid}/chart/Patient Summary`}>
            {relation.name}
          </ConfigurableLink>
        ),
        relation: relation?.relationshipType,
        age: relation?.relativeAge ?? '--',
        alive: relation?.dead ? t('dead', 'Dead') : t('alive', 'Alive'),
        causeOfDeath: (
          <ConceptObservations patientUuid={patientUuid} conceptUuid={concepts.probableCauseOfDeathConceptUuid} />
        ),
        patientUuid: relation,
        chronicDisease: <ConceptObservations patientUuid={patientUuid} conceptUuid={concepts.problemListConceptUuid} />,
      };
    }) ?? [];

  if (isLoading || isValidating) {
    return (
      <DataTableSkeleton
        headers={headers}
        aria-label="patient family table"
        showToolbar={false}
        showHeader={false}
        rowCount={3}
        zebra
        columnCount={3}
        className={styles.dataTableSkeleton}
      />
    );
  }

  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (familyRelationships.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>There is no family history data to display for this patient.</p>
          <Button onClick={handleAddHistory} renderIcon={Add} kind="ghost">
            {t('addRelationship', 'Add relationship')}
          </Button>
        </Tile>
      </Layer>
    );
  }

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        {isLoading && <DataTableSkeleton rowCount={5} />}{' '}
        <Button onClick={handleAddHistory} renderIcon={Add} kind="ghost">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <DataTable
        useZebraStyles
        size="sm"
        rows={tableRows ?? []}
        headers={headers}
        render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
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
        pageSizes={pageSizes}
        totalItems={relationships.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};
export default FamilyHistory;
