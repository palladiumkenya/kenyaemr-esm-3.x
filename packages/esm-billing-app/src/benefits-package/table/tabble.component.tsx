import {
  Button,
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { usePagination } from '@openmrs/esm-framework';
import {
  CardHeader,
  getPatientUuidFromUrl,
  launchPatientWorkspace,
  usePaginationInfo,
} from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PatientBenefit } from '../../types';
import styles from './benebfits-table.scss';

type TableCoponentProps = {
  patientBenefits: Array<PatientBenefit>;
};
const TableComponent: React.FC<TableCoponentProps> = ({ patientBenefits: benefits_ }) => {
  const { t } = useTranslation();
  const [patientBenefits, setBenefits] = useState<Array<PatientBenefit>>(benefits_);
  const patientUuid = getPatientUuidFromUrl();
  const headerTitle = t('benefits', 'Benefits');
  const [pageSize, setPageSize] = useState(10);
  const { results, totalPages, currentPage, goTo } = usePagination(patientBenefits, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, totalPages, currentPage, results.length);
  const handleLaunchPreAuthForm = (benefit: PatientBenefit) => {
    // benefits-pre-auth-form
    launchPatientWorkspace('benefits-pre-auth-form', {
      workspaceTitle: 'Benefits Pre-Auth Form',
      patientUuid,
      benefit,
      onSuccess: (benefits) => {
        setBenefits(benefits);
      },
    });
  };
  const rows = patientBenefits.map((benefit) => ({
    id: benefit.shaPackageCode,
    ...benefit,
    action: benefit.requirePreauth ? (
      <Button renderIcon={ArrowRight} onClick={() => handleLaunchPreAuthForm(benefit)}>
        Pre-Auth
      </Button>
    ) : (
      '--'
    ),
  }));

  const headers = [
    {
      key: 'shaPackageCode',
      header: 'Package Code',
    },
    {
      key: 'shaPackageName',
      header: 'Package Name',
    },
    {
      key: 'shaInterventionCode',
      header: 'Intervension Code',
    },
    {
      key: 'shaInterventionName',
      header: 'Intervension Name',
    },
    {
      key: 'shaInterventioTariff',
      header: 'Intervension Tariff',
    },
    {
      key: 'status',
      header: 'Approval status',
    },
    {
      key: 'action',
      header: 'Action',
    },
  ];

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={headerTitle}>{''}</CardHeader>
      <DataTable useZebraStyles size="sm" rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
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
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={patientBenefits.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      />
    </div>
  );
};

export default TableComponent;
