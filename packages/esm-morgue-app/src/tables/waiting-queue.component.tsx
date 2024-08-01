import React from 'react';
import GenericTable from './generic-table.component';
import { useDeceasedPatient } from './generic-table.resource';
import { formatDate } from '@openmrs/esm-framework';
import { toUpperCase } from '../helpers/expression-helper';

export const WaitingQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient('Test');

  const genericTableHeader = [
    { header: 'Deceased Name', key: 'name' },
    { header: 'ID No ', key: 'identification' },
    { header: 'Gender', key: 'gender' },
    { header: 'Dob', key: 'birthdate' },
    { header: 'Date of Death', key: 'deathDate' },
    { header: 'Cause of Death', key: 'causeOfDeath' },
    { header: 'Status Death', key: 'status' },
    { header: 'Queue', key: 'queue' },
    { header: 'Body Identification', key: 'identify' },
    { header: 'Residence', key: 'address4' },
  ];

  const rows =
    deceasedPatients?.map((patient) => ({
      id: patient.uuid,
      name: toUpperCase(patient.person.display),
      gender: patient.person.gender,
      birthdate: formatDate(new Date(patient.person.birthdate)),
      deathDate: formatDate(new Date(patient.person.deathDate)),
      causeOfDeath: patient.person.causeOfDeath?.display || 'N/A',
      status: patient.person.dead ? 'Deceased' : 'Alive',
      queue: 'N/A', // Add queue data if available
      identification: patient.identifiers[0]?.identifier || 'N/A',
      address4: patient.person.preferredAddress?.address4 || 'N/A',
    })) || [];

  return <GenericTable rows={rows} headers={genericTableHeader} />;
};
