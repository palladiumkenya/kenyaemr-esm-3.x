import React, { useEffect, useState } from 'react';
import { CardHeader, EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash/capitalize';
import { ErrorState, formatDate, launchWorkspace, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../../config-schema';
import { genericTableHeader, useEncounters } from './useEncounters';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
  DataTableSkeleton,
  Button,
} from '@carbon/react';
import EncounterObservations from './encounter-observations/encounter-observations.component';

type GenericDashboardProps = { patientUuid: string };

const GenericDashboard: React.FC<GenericDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { specialClinics } = useConfig<ConfigObject>();
  const [clinic, setClinic] = useState('');
  const clinicInfo = specialClinics.find(({ id }) => id === clinic);
  const { encounters, isLoading, error, mutate } = useEncounters(
    clinicInfo?.encounterTypeUuid,
    clinicInfo?.formUuid,
    patientUuid,
  );

  useEffect(() => {
    const handleURLChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clinicParam = urlParams.get('clinic');
      if (clinicParam) {
        setClinic(clinicParam);
      }
    };

    // Call once on initial load
    handleURLChange();
    window.onpopstate = handleURLChange;
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const clinicalFormTitle = capitalize(clinic.replace('-', ' '));

  const handleWorkspaceForm = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: clinicalFormTitle.replace('clinic', 'form'),
      mutateForm: mutate,
      formInfo: {
        encounterUuid: '',
        formUuid: clinicInfo?.formUuid,
        additionalProps: {},
      },
    });
  };

  const handleWorkspaceEditForm = (encounterUuid: string = '') => {
    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: clinicalFormTitle.replace('clinic', 'form'),
      mutateForm: mutate,
      formInfo: {
        encounterUuid: encounterUuid,
        formUuid: clinicInfo?.formUuid,
        additionalProps: {},
      },
    });
  };

  const rows =
    encounters?.map((encounter) => ({
      id: `${encounter.uuid}`,
      encounterDatetime: formatDate(new Date(encounter.encounterDatetime)),
      visitType: encounter.visit?.visitType?.display ?? '--',
      provider:
        encounter.encounterProviders?.length > 0
          ? capitalize(encounter.encounterProviders[0].provider['display'])
          : '--',
    })) ?? [];

  if (isLoading) {
    return <DataTableSkeleton headers={genericTableHeader} aria-label="sample table" />;
  }

  if (error) {
    return <ErrorState headerTitle={clinicalFormTitle} error={error} />;
  }

  if (encounters.length === 0) {
    return (
      <EmptyState headerTitle={clinicalFormTitle} displayText={clinicalFormTitle} launchForm={handleWorkspaceForm} />
    );
  }

  return (
    <div>
      <CardHeader title={capitalize(clinic.replace('-', ' '))}>
        <Button onClick={handleWorkspaceForm} kind="ghost">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <DataTable size="sm" useZebraStyles rows={rows} headers={genericTableHeader}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getExpandedRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            title={clinicalFormTitle}
            description={`Encounters ${t('for', 'for')} ${clinicalFormTitle}`}
            {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader aria-label="expand row" />
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
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
                      <>
                        <EncounterObservations observations={encounters[index]['obs'] ?? []} />
                        <Button
                          onClick={() => handleWorkspaceEditForm(encounters[index].uuid)}
                          kind="tertiary"
                          size="sm">
                          {t('edit', 'Edit')}
                        </Button>
                      </>
                    </TableExpandedRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default GenericDashboard;
