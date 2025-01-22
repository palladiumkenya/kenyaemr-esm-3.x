import React from 'react';
import useDependents, { createPatientAndLinkToPatientAsRelatedPerson, type Dependent } from './useDependents';
import {
  DataTable,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  DataTableSkeleton,
  Button,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash/capitalize';

type DependentProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const DependentsComponent: React.FC<DependentProps> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const kenyaemrNationalIdIdentifierType = '49af6cdc-7968-4abb-bf46-de10d7f4859f';
  const nationalID = patient?.identifier?.find((identifier) =>
    identifier?.type?.coding?.some((code) => code?.code === kenyaemrNationalIdIdentifierType),
  );
  const { dependents = [], isLoading, error } = useDependents(nationalID?.value);

  const handleRegisterDependent = (dependent: Dependent) => {
    createPatientAndLinkToPatientAsRelatedPerson(patientUuid, dependent, t);
  };

  const headers = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'relationship',
      header: 'Relationship',
    },
    {
      key: 'phoneNumber',
      header: 'Phone Number',
    },
    {
      key: 'gender',
      header: 'Gender',
    },
    {
      key: 'actions',
      header: 'Actions',
    },
  ];

  const rows = dependents?.map((dependent, index) => ({
    id: `${index}-${dependent.name}`,
    name: capitalize(dependent.name),
    relationship: capitalize(dependent.relationship),
    phoneNumber: dependent.phoneNumber,
    gender: capitalize(dependent.gender),
    actions: (
      <Button size="xs" kind="ghost" onClick={() => handleRegisterDependent(dependent)}>
        {t('registerDependent', 'Register Dependent')}
      </Button>
    ),
  }));

  if (isLoading) {
    return <DataTableSkeleton size="xs" aria-label={t('dependents')} headers={headers} showHeader showToolbar />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (dependents.length === 0) {
    return <div>{t('noDependentsFoundFromHIE', 'No dependents found from HIE')}</div>;
  }

  return (
    <div>
      <DataTable size="xs" useZebraStyles rows={rows} headers={headers}>
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
    </div>
  );
};

export default DependentsComponent;
