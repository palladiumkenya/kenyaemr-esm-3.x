import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { formatDatetime, launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';

import { useAdmissionRequest } from './in-patient.resource';
import { ConfigObject } from '../config-schema';
import { Add } from '@carbon/react/icons';

type AdmissionRequestProps = {
  patientUuid: string;
};

const AdmissionRequest: React.FC<AdmissionRequestProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const {
    formsList: { admissionRequestFormUuid },
  } = useConfig<ConfigObject>();
  const { admissionRequest, isLoading, error, mutate } = useAdmissionRequest(patientUuid);

  const rows = useMemo(() => {
    return admissionRequest.map((admissionRequest) => ({
      id: admissionRequest.patient.uuid,
      admissionLocation: admissionRequest.dispositionLocation?.display,
      admissionType: admissionRequest.dispositionType,
      disposition: admissionRequest.disposition.display,
      requestDatetime: formatDatetime(new Date(admissionRequest.dispositionEncounter.encounterDatetime), {
        mode: 'standard',
      }),
    }));
  }, [admissionRequest]);

  const headers = useMemo(() => {
    return [
      { key: 'requestDatetime', header: t('requestDatetime', 'Request Datetime') },
      { key: 'admissionLocation', header: t('admissionLocation', 'Admission Location') },
      { key: 'admissionType', header: t('admissionType', 'Admission Type') },
      { key: 'disposition', header: t('disposition', 'Disposition') },
    ];
  }, []);

  const handleLaunchAdmissionRequestForm = () => {
    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Admission Request',
      mutateForm: mutate,
      formInfo: {
        formUuid: admissionRequestFormUuid,
        encounterUuid: '',
      },
    });
  };

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('admissionRequest', 'Admission Request')} />;
  }

  if (admissionRequest.length === 0) {
    return (
      <EmptyState
        displayText={t('admissionRequests', 'admission requests')}
        headerTitle={t('admissionRequest', 'Admission Request')}
        launchForm={handleLaunchAdmissionRequestForm}
      />
    );
  }

  return (
    <div>
      <CardHeader title={t('admissionRequest', 'Admission Request')}>
        <Button renderIcon={Add} onClick={handleLaunchAdmissionRequestForm} kind="ghost">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <DataTable size="sm" rows={rows} headers={headers}>
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
    </div>
  );
};

export default AdmissionRequest;
