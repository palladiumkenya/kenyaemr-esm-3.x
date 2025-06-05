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
  OverflowMenu,
  OverflowMenuItem,
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
import { deleteRelationship } from '../relationships/relationship.resources';
import HIVStatus from '../contact-list/hiv-status.component';
import { type Contact } from '../types';
import { extractNameString, uppercaseText } from '../utils/expression-helper';

interface FamilyHistoryProps {
  patientUuid: string;
}

const FamilyHistory: React.FC<FamilyHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const { concepts } = config;
  const layout = useLayoutType();
  const [pageSize, setPageSize] = useState(10);
  const size = layout === 'tablet' ? 'lg' : 'md';
  const { relationships, error, isLoading, isValidating } = usePatientRelationships(patientUuid);
  const headerTitle = t('familyContacts', 'Family contacts');
  const { results, totalPages, currentPage, goTo } = usePagination(relationships, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);

  const headers = [
    {
      header: t('listingDate', 'Listing date'),
      key: 'startDate',
    },
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
      header: t('sex', 'Sex'),
      key: 'sex',
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
    {
      header: t('hivStatus', 'HIV Status'),
      key: 'hivStatus',
    },
    {
      header: t('baselineHivStatus', 'Baseline HIV Status'),
      key: 'baseLineivStatus',
    },
    {
      header: t('livingWithClient', 'Living with client'),
      key: 'livingWithClient',
    },
    {
      header: t('pnsAproach', 'PNS Aproach'),
      key: 'pnsAproach',
    },
    {
      header: t('ipvOutcome', 'IPV Outcome'),
      key: 'ipvOutcome',
    },
    { header: t('actions', 'Actions'), key: 'actions' },
  ];

  const handleAddHistory = () => {
    launchWorkspace('family-relationship-form', {
      workspaceTitle: 'Family Relationship Form',
      patientUuid,
    });
  };
  const handleEditRelationship = (relation: Contact) => {
    launchWorkspace('contact-list-update-form', {
      relation,
      workspaceTitle: t('editContactList', 'Edit contact list'),
      patientUuid,
    });
  };

  const tableRows =
    results?.map((relation) => {
      const patientUuid = relation.patientUuid;

      return {
        id: `${relation.uuid}`,
        startDate: relation.startDate ?? '--',
        name: (
          <ConfigurableLink
            style={{ textDecoration: 'none' }}
            to={window.getOpenmrsSpaBase() + `patient/${relation.relativeUuid}/chart/Patient Summary`}>
            {extractNameString(uppercaseText(relation.name))}
          </ConfigurableLink>
        ),
        relation: relation?.relationshipType,
        age: relation?.relativeAge ?? '--',
        sex: relation.gender,

        alive: relation?.dead ? t('dead', 'Dead') : t('alive', 'Alive'),
        causeOfDeath: (
          <ConceptObservations patientUuid={patientUuid} conceptUuid={concepts.probableCauseOfDeathConceptUuid} />
        ),
        patientUuid: relation,
        chronicDisease: <ConceptObservations patientUuid={patientUuid} conceptUuid={concepts.problemListConceptUuid} />,
        hivStatus: <HIVStatus relativeUuid={relation.relativeUuid} />,
        baseLineivStatus: relation.baselineHIVStatus ?? '--',
        livingWithClient: relation.livingWithClient ?? '--',
        pnsAproach: relation.pnsAproach ?? '--',
        ipvOutcome: relation.ipvOutcome ?? '--',

        actions: (
          <>
            <OverflowMenu size={size} flipped>
              <OverflowMenuItem itemText={t('edit', 'Edit')} onClick={() => handleEditRelationship(relation)} />
              <OverflowMenuItem itemText={t('delete', 'Delete')} onClick={() => deleteRelationship(relation.uuid)} />
            </OverflowMenu>
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

  if (relationships.length === 0) {
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
