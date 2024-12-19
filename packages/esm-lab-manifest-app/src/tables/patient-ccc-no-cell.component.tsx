import { InlineLoading } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { LabManifestConfig } from '../config-schema';
import useIsKDoDSite from '../hooks/useIsKDoDSite';
import usePatient from '../hooks/usePatient';

type Props = {
  patientUuid: string;
};

const PatientCCCNumbercell: React.FC<Props> = ({ patientUuid }) => {
  const { isLoading, patient } = usePatient(patientUuid);
  const {
    patientIdentifierTypes: { cccNumberIdentifierType, kdodIdentifierType },
  } = useConfig<LabManifestConfig>();
  const { isKDoDSite, error, isLoading: siteLoading } = useIsKDoDSite();

  if (isLoading || siteLoading) {
    return <InlineLoading status="active" iconDescription="Loading" />;
  }

  const identifierType = isKDoDSite ? kdodIdentifierType : cccNumberIdentifierType;
  return <>{patient?.identifiers?.find((id) => id.identifierType.uuid === identifierType)?.identifier ?? '--'}</>;
};

export default PatientCCCNumbercell;
