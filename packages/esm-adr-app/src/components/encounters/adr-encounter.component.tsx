import React, { useState } from 'react';
import {
  Button,
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import styles from './encounter.scss';
import { useTranslation } from 'react-i18next';
import {
  ActionMenuButton,
  formatDatetime,
  isDesktop,
  launchWorkspace,
  parseDate,
  restBaseUrl,
  showModal,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { MappedAdrEncounter } from '../../types';
import { Email, Printer, TaskView } from '@carbon/react/icons';
type adrEncounterProps = {
  encounters: Array<MappedAdrEncounter>;
};

const AdrEncounter: React.FC<adrEncounterProps> = ({ encounters }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(10);
  const headers = [
    { header: 'Date & time', key: 'encounterDatetime' },
    { header: 'Name', key: 'patientName' },
    { header: 'Visit type', key: 'visitTypeName' },
    { header: 'Form name', key: 'formName' },
    { header: 'Provider', key: 'provider' },
    { header: 'Actions', key: 'action' },
  ];
  const sortedEncounters = encounters.sort((a, b) => {
    const dateA = new Date(a.encounterDatetime || 0).getTime();
    const dateB = new Date(b.encounterDatetime || 0).getTime();
    return dateB - dateA;
  });
  const { paginated, goTo, results, currentPage } = usePagination(encounters, pageSize);
  const ReviewIcon = (props) => <TaskView {...props} />;

  const handler = (encounter) => {
    launchWorkspace('patient-adr-workspace', { encounter: encounter });
  };
  const handleSendEmail = (encounter) => {
    const dispose = showModal('adr-email-modal', {
      onClose: () => dispose(),
      encounter,
      onEmailSent: () => {
        // checkEmailStatus();
        dispose();
      },
    });
  };

  const tableRows = sortedEncounters.map((encounter) => ({
    encounterDatetime: encounter?.encounterDatetime
      ? formatDatetime(parseDate(encounter?.encounterDatetime), { mode: 'wide' })
      : '--',
    patientName: encounter?.patientName,
    visitTypeName: encounter?.visitTypeName,
    formName: encounter?.formName,
    id: encounter?.encounterUuid,
    provider: encounter?.provider || '--',
    action: (
      <>
        <Button kind="tertiary" renderIcon={ReviewIcon} onClick={() => handler(encounter)}>
          {t('review', 'Review')}
        </Button>
        <Button
          kind="ghost"
          size="sm"
          onClick={() => {
            const dispose = showModal('adr-print-preview-modal', {
              onClose: () => dispose(),
              title: `${t('adrReport', 'ADR Report')} - ${encounter.patientName}`,
              documentUrl: `/openmrs${restBaseUrl}/kenyaemr/adpdf/view?patientUuid=${encounter.patientUuid}`,
            });
          }}
          renderIcon={Printer}>
          {t('printReport', 'Print Report')}
        </Button>
        <Button
          kind="ghost"
          size="sm"
          onClick={() => handleSendEmail(encounter)}
          renderIcon={Email}
          title={t('sendEmail', 'Send Email')}>
          {t('sendEmail', 'Send Email')}
        </Button>
      </>
    ),
  }));
  if (encounters.length === 0) {
    return (
      <div className={styles.encounterContainer}>
        <EmptyState
          displayText={t('noAdrEncountersFound', 'Adr assessment encounters')}
          headerTitle={t('noEncountersFoundTitle', 'No encounters found')}
        />
      </div>
    );
  }

  return (
    <div className={styles.encounterContainer}>
      <DataTable size={responsiveSize} rows={tableRows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getToolbarProps,
          onInputChange,
          getTableContainerProps,
        }) => (
          <TableContainer
            className={styles.encounterTable}
            title={t('adrAssessmentEncounters', 'ADR Assessment Encounters')}
            description={t('summaryOfAdrAssessmentEncounters', 'Summary of ADR assessment encounters')}
            {...getTableContainerProps()}>
            <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
              <TableToolbarContent>
                <TableToolbarSearch persistent onChange={onInputChange} />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} aria-label={t('encounters', 'Encounters')}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      key={header.key}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    {...getRowProps({
                      row,
                    })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      {paginated && (
        <Pagination
          forwardText="Next page"
          backwardText="Previous page"
          page={currentPage}
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={encounters?.length}
          className={styles.pagination}
          size={responsiveSize}
          onChange={({ pageSize: newPageSize, page: newPage }) => {
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
            if (newPage !== currentPage) {
              goTo(newPage);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdrEncounter;
