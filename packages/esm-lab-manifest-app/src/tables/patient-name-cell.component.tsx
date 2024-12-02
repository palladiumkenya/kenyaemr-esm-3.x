import React from 'react';
import { Order } from '../types';
import { ConfigurableLink } from '@openmrs/esm-framework';
import usePatient from '../hooks/usePatient';
import { InlineLoading } from '@carbon/react';

type Props = {
  patient: Order['patient'];
};

const PatientNameCell: React.FC<Props> = ({ patient: { uuid, identifiers } }) => {
  const { isLoading, patient } = usePatient(uuid);
  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient Summary';

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" />;
  }

  return (
    <ConfigurableLink to={patientChartUrl} templateParams={{ patientUuid: uuid }} style={{ textDecoration: 'none' }}>
      {patient?.person?.display}
    </ConfigurableLink>
  );
};

export default PatientNameCell;
