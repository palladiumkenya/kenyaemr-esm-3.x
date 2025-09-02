import React, { useState } from 'react';
import { DataTable, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash/capitalize';
import styles from './dependants.scss';
import { extractDependentsFromContacts, maskName, transformToDependentPayload } from '../helper';
import { showSnackbar } from '@openmrs/esm-framework';
import { createDependentPatient } from './dependants.resource';

type DependentProps = {
  patient: fhir.Patient;
};

const DependentsComponent: React.FC<DependentProps> = ({ patient }) => {
  const { t } = useTranslation();
  const [submittingStates, setSubmittingStates] = useState<Record<string, boolean>>({});

  const dependents = extractDependentsFromContacts(patient);

  const handleRegisterDependent = async (dependent: any) => {
    setSubmittingStates((prev) => ({ ...prev, [dependent.id]: true }));
    try {
      const dependentPayload = transformToDependentPayload(dependent);
      await createDependentPatient(dependentPayload, t);
    } catch (error) {
      showSnackbar({
        title: t('registerDependentErrorTitle', 'Registration Error'),
        subtitle: t('registerDependentError', 'Failed to register dependent. Please try again.'),
        kind: 'error',
      });
    } finally {
      setSubmittingStates((prev) => ({ ...prev, [dependent.id]: false }));
    }
  };

  const headers = [
    {
      key: 'name',
      header: t('name', 'Name'),
    },
    {
      key: 'relationship',
      header: t('relationship', 'Relationship'),
    },
    {
      key: 'gender',
      header: t('gender', 'Gender'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const rows = dependents.map((dependent) => ({
    id: dependent.id,
    name: maskName(capitalize(dependent.name.toLowerCase())),
    relationship: capitalize(dependent.relationship.toLowerCase()),
    gender: capitalize(dependent.gender),
    actions: (
      <Button
        size="sm"
        kind="ghost"
        onClick={() => handleRegisterDependent(dependent)}
        disabled={submittingStates[dependent.id]}>
        {submittingStates[dependent.id]
          ? t('registering', 'Registering...')
          : t('registerDependent', 'Register Dependent')}
      </Button>
    ),
  }));

  if (dependents.length === 0) {
    return <div>{t('noDependentsFound', 'No dependents found for this patient')}</div>;
  }

  return (
    <div>
      <span className={styles.dependentsTitle}>
        {t('dependents', 'Dependent(s)')} ({dependents.length})
      </span>
      <DataTable size="xs" useZebraStyles rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHeader key={index} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index} {...getRowProps({ row })}>
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell.value}</TableCell>
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
