import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  ConfigurableLink,
  ErrorState,
  isDesktop,
  launchWorkspace,
  useConfig,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { ConfigObject } from '../config-schema';
import useContacts from '../hooks/useContacts';
import { deleteRelationship } from '../relationships/relationship.resources';
import styles from './contact-list.scss';
import ContactTracingHistory from './contact-tracing-history.component';
import HIVStatus from './hiv-status.component';

interface ContactListProps {
  patientUuid: string;
}

const ContactList: React.FC<ContactListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const headerTitle = t('pnsContactList', 'PNS Contact list');
  const layout = useLayoutType();
  const size = layout === 'tablet' ? 'lg' : 'md';
  const { contacts, error, isLoading } = useContacts(patientUuid);
  const { results, totalPages, currentPage, goTo } = usePagination(contacts, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);
  const {
    formsList: { htsClientTracingFormUuid },
  } = useConfig<ConfigObject>();
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
      header: t('contact', 'Contact'),
      key: 'contact',
    },
    {
      header: t('contactCreated', 'Contact created'),
      key: 'contactCreated',
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

  const handleAddContact = () => {
    launchWorkspace('contact-list-form', {
      workspaceTitle: 'Contact Form',
      patientUuid,
    });
  };

  const handleLaunchContactTracingForm = (contactUuid: string) => {
    launchWorkspace('kenyaemr-cusom-form-entry-workspace', {
      formUuid: htsClientTracingFormUuid,
      workspaceTitle: t('contactTracingForm', 'Contact tracing form'),

      patientUuid: contactUuid,
      encounterUuid: '',
      mutateForm: () => {
        mutate((key) => true, undefined, {
          revalidate: true,
        });
      },
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
        startDate: relation.startDate ?? '--',
        name: (
          <ConfigurableLink
            style={{ textDecoration: 'none' }}
            to={window.getOpenmrsSpaBase() + `patient/${relation.relativeUuid}/chart/Patient Summary`}>
            {relation.name}
          </ConfigurableLink>
        ),
        contactCreated: relation.personContactCreated ?? 'No',
        relation: relation?.relationshipType,
        age: relation?.relativeAge ?? '--',
        sex: relation.gender,
        alive: relation?.dead ? t('dead', 'Dead') : t('alive', 'Alive'),
        contact: relation.contact ?? '--',
        hivStatus: <HIVStatus relativeUuid={relation.relativeUuid} />,
        baseLineivStatus: relation.baselineHIVStatus ?? '--',
        livingWithClient: relation.livingWithClient ?? '--',
        pnsAproach: relation.pnsAproach ?? '--',
        ipvOutcome: relation.ipvOutcome ?? '--',
        actions: (
          <>
            <OverflowMenu size={size} flipped>
              <OverflowMenuItem itemText={t('edit', 'Edit')} onClick={() => handleEditRelationship(relation.uuid)} />
              <OverflowMenuItem
                itemText={t('traceContact', 'Trace Contact')}
                onClick={() => handleLaunchContactTracingForm(patientUuid)}
              />
              <OverflowMenuItem itemText={t('delete', 'Delete')} onClick={() => deleteRelationship(relation.uuid)} />
            </OverflowMenu>
          </>
        ),
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
          <p className={styles.content}>
            {t('noContactToDisplay', 'There is no contact data to display for this patient.')}
          </p>
          <Button onClick={handleAddContact} renderIcon={Add} kind="ghost">
            {t('addPNSContact', 'Add PNS Contact')}
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
                  <React.Fragment key={row.id}>
                    <TableExpandRow
                      {...getRowProps({
                        row,
                      })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableExpandRow>

                    <TableExpandedRow
                      colSpan={headers.length + 1}
                      className="demo-expanded-td"
                      {...getExpandedRowProps({
                        row,
                      })}>
                      <ContactTracingHistory patientUuid={results.find((r) => r.uuid === row.id)?.patientUuid} />
                    </TableExpandedRow>
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
