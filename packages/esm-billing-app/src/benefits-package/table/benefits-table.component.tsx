import { Button, Tile, Layer } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyDataIllustration,
  EmptyState,
  getPatientUuidFromUrl,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import styles from './benebfits-table.scss';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Package, PatientBenefit } from '../../types';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';

const BenefitsTable = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const [eligibleBenefits, setEligibleBenefits] = useState<Array<PatientBenefit>>([]);
  const [eligible, setEligible] = useState(false);
  const headerTitle = t('benefits', 'Benefits');

  const handleLaunchRequestEligibility = () => {
    launchPatientWorkspace('benefits-eligibility-request-form', {
      workspaceTitle: 'Benefits Eligibility Request Form',
      patientUuid,
      onSuccess: (eligibleBenefits: Array<PatientBenefit>) => {
        setEligibleBenefits(eligibleBenefits);
        setEligible(true);
      },
    });
  };

  if (!eligible) {
    return (
      <div>
        <Layer>
          <Tile className={styles.tile}>
            <CardHeader title={headerTitle}>
              <Button
                kind="ghost"
                renderIcon={ArrowRight}
                onClick={handleLaunchRequestEligibility}
                className={styles.btnOutline}>
                {t('requestEligibility', 'Request Eligibility')}
              </Button>
            </CardHeader>
            <EmptyDataIllustration />
            <p className={styles.content}>{t('noBenefits', 'No benefit packages, request eligibility')}</p>
            <Button onClick={handleLaunchRequestEligibility} renderIcon={ArrowRight} kind="ghost">
              {t('requestEligibility', 'Request Eligibility')}
            </Button>
          </Tile>
        </Layer>
      </div>
    );
  }
  if (eligibleBenefits.length === 0) {
    return <EmptyState headerTitle={headerTitle} displayText={headerTitle} />;
  }

  const headers = [
    {
      key: 'shaPackageCode',
      header: 'Code',
    },
    {
      key: 'status',
      header: 'Approval status',
    },
    {
      key: 'shaPackageName',
      header: 'Name',
    },
    {
      key: 'shaInterventionCode',
      header: 'SHA Intervension Code',
    },
    {
      key: 'shaInterventionName',
      header: 'SHA Intervension Name',
    },
    {
      key: 'shaInterventioTariff',
      header: 'SHA Intervension Taarif',
    },
    {
      key: 'action',
      header: 'Action',
    },
  ];

  const rows = eligibleBenefits.map((benefit) => ({
    ...benefit,
    action: benefit.requirePreauth ? <Button renderIcon={ArrowRight}>Pre-Auth</Button> : '--',
  }));
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
      {/* <Pagination
        page={currentPage}
        pageSize={pageSize}
        pageSizes={pageSizes}
        totalItems={contacts.length}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
      /> */}
    </div>
  );
};

export default BenefitsTable;
