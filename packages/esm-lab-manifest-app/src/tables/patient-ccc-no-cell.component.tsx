import React from 'react';
import { Order } from '../types';
import usePatient from '../hooks/usePatient';
import { InlineLoading } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { LabManifestConfig } from '../config-schema';

type Props = {
  patient: Order['patient'];
};

const PatientCCCNumbercell: React.FC<Props> = ({ patient: { uuid, identifiers } }) => {
  const { isLoading, patient } = usePatient(uuid);
  const { cccNumberIdentifierType } = useConfig<LabManifestConfig>();
  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient Summary';

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" />;
  }
  return <>{patient?.identifiers?.find((id) => id.identifierType.uuid === cccNumberIdentifierType)?.identifier}</>;
};

export default PatientCCCNumbercell;
