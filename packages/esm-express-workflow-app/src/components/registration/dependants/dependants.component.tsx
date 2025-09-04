import React, { useState } from 'react';
import { DataTable, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash/capitalize';
import styles from './dependants.scss';
import { createDependentPatient } from './dependants.resource';
import { maskName, transformToDependentPayload } from '../helper';

type DependentProps = {
  patient: fhir.Patient;
};

const DependentsComponent: React.FC<DependentProps> = ({ patient }) => {
  console.log('Rendering DependentsComponent for patient:', patient);
  const { t } = useTranslation();
  const [submittingStates, setSubmittingStates] = useState<Record<string, boolean>>({});

  const getDependentsFromContacts = (patient: fhir.Patient) => {
    if (!patient?.contact) return [];

    return patient.contact.map((contact, index) => {
      const relationship = contact.relationship?.[0]?.coding?.[0]?.display || 'Unknown';

      const name =
        contact.name?.text?.trim() ||
        `${contact.name?.given?.join(' ') || ''} ${contact.name?.family || ''}`.trim() ||
        'Unknown';

      const phoneContact = contact.telecom?.find((t) => t.system === 'phone');
      const phoneNumber = phoneContact?.value || 'N/A';

      const emailContact = contact.telecom?.find((t) => t.system === 'email');
      const email = emailContact?.value || 'N/A';

      const gender = contact.gender || 'Unknown';

      const birthDateExtension = contact.extension?.find(
        (ext) => ext.url === 'https://ts.kenya-hie.health/fhir/StructureDefinition/date_of_birth',
      );
      const birthDate = birthDateExtension?.valueString || 'Unknown';

      const identifierExtensions = contact.extension?.filter((ext) => ext.url === 'identifiers') || [];
      const shaNumber = identifierExtensions.find(
        (ext) => ext.valueIdentifier?.type?.coding?.[0]?.code === 'sha-number',
      )?.valueIdentifier?.value;

      const nationalId = identifierExtensions.find(
        (ext) => ext.valueIdentifier?.type?.coding?.[0]?.code === 'national-id',
      )?.valueIdentifier?.value;

      const birthCertificate = identifierExtensions.find(
        (ext) => ext.valueIdentifier?.type?.coding?.[0]?.code === 'birth-certificate',
      )?.valueIdentifier?.value;

      return {
        id: contact.id || `contact-${index}`,
        name,
        relationship,
        phoneNumber,
        email,
        gender,
        birthDate,
        shaNumber,
        nationalId,
        birthCertificate,
        contactData: contact,
      };
    });
  };

  const dependents = getDependentsFromContacts(patient);


  const handleRegisterDependent = async (dependent: any) => {
    console.log('Registering dependent:', dependent);

    setSubmittingStates((prev) => ({ ...prev, [dependent.id]: true }));

    try {
      const dependentPayload = transformToDependentPayload(dependent);
      await createDependentPatient(dependentPayload, t);
    } catch (error) {
      console.error('Failed to register dependent:', error);
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
