import React from 'react';
import { Order } from '../types';
import { ConfigurableLink } from '@openmrs/esm-framework';
import usePatient from '../hooks/usePatient';
import { InlineLoading } from '@carbon/react';

type Props = {
  patientUuid: string;
};

const PatientNameCell: React.FC<Props> = ({ patientUuid }) => {
  const { isLoading, patient } = usePatient(patientUuid);
  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient Summary';

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" />;
  }

  return (
    <ConfigurableLink
      to={patientChartUrl}
      templateParams={{ patientUuid: patientUuid }}
      style={{ textDecoration: 'none' }}>
      {patient?.person?.display}
    </ConfigurableLink>
  );
};

export default PatientNameCell;
