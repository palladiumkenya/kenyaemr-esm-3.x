import React from 'react';
import { ErrorState, isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, usePaginationInfo } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  Pagination,
} from '@carbon/react';

import { useForm, usePaginatedEncounters, extractComplaintsFromObservations } from './complaints.resource';
import { ConfigObject } from '../config-schema';

import styles from './patient-complaints.scss';

const pageSize = 5;

type PatientComplaintsComponentProps = {
  patientUuid: string;
};

const PatientComplaintsComponent = ({ patientUuid }: PatientComplaintsComponentProps) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const config = useConfig<ConfigObject>();
  const {
    data = [],
    isLoading: isLoadingEncounters,
    error: errorEncounters,
    currentPage,
    goTo,
    totalPages,
  } = usePaginatedEncounters(patientUuid, config.encounterTypes.triage, pageSize);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { conceptLabelMap, isLoading: isLoadingForm, error: errorForm } = useForm(config.formsList.complaintsFormUuid);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, data?.length);
  if (isLoadingEncounters || isLoadingForm) {
    return <DataTableSkeleton />;
  }

  if (errorEncounters || errorForm) {
    return <ErrorState error={errorEncounters || errorForm} headerTitle={t('complaints', 'Complaints')} />;
  }

  const complaintsTableHeaders = [
    {
      key: 'complaint',
      header: t('complaint', 'Complaint'),
    },
    {
      key: 'duration',
      header: t('duration', 'Duration'),
    },
    {
      key: 'onset',
      header: t('onset', 'Onset'),
    },
  ];

  const observations = data?.map((encounter) => encounter.obs) ?? [];
  const complaints = extractComplaintsFromObservations(
    observations.flatMap((observation) => observation),
    config,
    conceptLabelMap,
  );

  if (complaints.length === 0) {
    return <EmptyState displayText={t('Complaints', 'Complaints')} headerTitle={t('complaints', 'Complaints')} />;
  }

  return (
    <div className={styles.patientComplaintsContainer}>
      <CardHeader title="Complaints">
        <></>
      </CardHeader>
      <DataTable size={responsiveSize} useZebraStyles rows={complaints} headers={complaintsTableHeaders}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, getCellProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell {...getCellProps({ cell })}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <Pagination
        className={styles.pagination}
        backwardText={t('previousPage', 'Previous page')}
        forwardText={t('nextPage', 'Next page')}
        page={currentPage}
        pageSize={pageSize}
        pageSizeInputDisabled={true}
        pageSizes={pageSizes}
        totalItems={complaints.length}
        onChange={({ page }) => {
          goTo(page);
        }}
      />
    </div>
  );
};

export default PatientComplaintsComponent;
