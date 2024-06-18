import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Row,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { ErrorState, isDesktop, launchWorkspace, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContacts } from './contact-list.resource';
import styles from './contact-list.scss';

interface ContactListProps {
  patientUuid: string;
}

const ContactList: React.FC<ContactListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('contactList', 'Contact list');
  const layout = useLayoutType();
  const { contacts, error, isLoading } = useContacts(patientUuid);
  const { results, totalPages, currentPage, goTo } = usePagination(contacts, pageSize);
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
      header: t('contact', 'Contact'),
      key: 'contact',
    },
    {
      header: t('status', 'Status'),
      key: 'status',
    },
    {
      header: t('baselineStatus', 'Base line status'),
      key: 'baselineStatus',
    },
  ];

  const handleAddContact = () => {
    launchWorkspace('contact-list-form', {
      workspaceTitle: 'Contact Form',
    });
  };

  const tableRows =
    results?.map((relation) => {
      const patientUuid = relation.patientUuid;

      return {
        id: `${relation.uuid}`,
        startDate: relation.startDate,
        name: relation.name,
        relation: relation?.relationshipType,
        age: relation?.relativeAge ?? '--',
        sex: relation.gender,
        alive: relation?.dead ? t('dead', 'Dead') : t('alive', 'Alive'),
        contact: relation.contact,
        status: '--',
        baselineStatus: '--',
      };
    }) ?? [];

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (contacts.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>There is contact data to list for this patient.</p>
          <Button onClick={handleAddContact} renderIcon={Add} kind="ghost">
            {t('recordContact', 'Record Contact')}
          </Button>
        </Tile>
      </Layer>
    );
  }
  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>
        <Button onClick={handleAddContact} renderIcon={Add} kind="ghost">
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
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                    <TableCell>
                      <Row className={styles.inlineActions}>
                        <Button kind="tertiary" renderIcon={Edit} iconDescription="Edit Record" hasIconOnly />
                        <Button kind="tertiary" renderIcon={TrashCan} iconDescription="Delete Record" hasIconOnly />
                      </Row>
                    </TableCell>
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
        totalItems={contacts.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default ContactList;
