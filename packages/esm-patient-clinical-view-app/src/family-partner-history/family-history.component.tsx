import React, { useCallback, useMemo, useState } from 'react';
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
  TableExpandedRow,
  TableExpandRow,
  TableExpandHeader,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { EmptyDataIllustration, ErrorState, CardHeader, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import {
  ConfigurableLink,
  isDesktop,
  launchWorkspace,
  useConfig,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { ExtractedRelationship, PARENT_CHILD_RELATIONSHIP, usePatientRelationships } from './relationships.resource';
import ConceptObservations from './concept-obs.component';
import type { ConfigObject } from '../config-schema';
import styles from './family-history.scss';
import { deleteRelationship } from '../relationships/relationship.resources';
import MotherInfoExpandedRow from './mother-info-expanded-row.component';

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
  const isMother = useCallback(
    (relation: ExtractedRelationship) => {
      return (
        relation?.relationshipTypeUUID ===
          familyRelationshipsTypeList?.find((r) => r.display === PARENT_CHILD_RELATIONSHIP)?.uuid &&
        relation?.relativeGender === 'F'
      );
    },
    [familyRelationshipsTypeList],
  );
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
      header: t('gender', 'Gender'),
      key: 'gender',
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
    { header: t('actions', 'Actions'), key: 'actions' },
  ];

  const handleAddHistory = () => {
    launchWorkspace('family-relationship-form', {
      workspaceTitle: 'Family Relationship Form',
      patientUuid,
    });
  };
  const handleEditRelationship = (relationShipUuid: string) => {
    launchWorkspace('relationship-update-form', {
      relationShipUuid,
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
        gender: relation?.relativeGender,
        age: relation?.relativeAge ?? '--',
        alive: relation?.dead ? t('dead', 'Dead') : t('alive', 'Alive'),
        causeOfDeath: (
          <ConceptObservations patientUuid={patientUuid} conceptUuid={concepts.probableCauseOfDeathConceptUuid} />
        ),
        patientUuid: relation,
        chronicDisease: <ConceptObservations patientUuid={patientUuid} conceptUuid={concepts.problemListConceptUuid} />,
        actions: (
          <>
            <Button
              renderIcon={Edit}
              hasIconOnly
              kind="ghost"
              iconDescription="Edit"
              onClick={() => handleEditRelationship(relation.uuid)}
            />
            <Button
              renderIcon={TrashCan}
              hasIconOnly
              kind="ghost"
              iconDescription="Delete"
              onClick={() => deleteRelationship(relation.uuid)}
            />
          </>
        ),
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
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getTableContainerProps,
          getRowProps,
          getExpandedRowProps,
        }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader aria-label="expand row" />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
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
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {isMother(results.find((r) => r.uuid === row.id)) && (
                      <TableExpandedRow
                        colSpan={headers.length + 1}
                        className="demo-expanded-td"
                        {...getExpandedRowProps({
                          row,
                        })}>
                        <MotherInfoExpandedRow patientUuid={results.find((r) => r.uuid === row.id)?.patientUuid} />
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
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
