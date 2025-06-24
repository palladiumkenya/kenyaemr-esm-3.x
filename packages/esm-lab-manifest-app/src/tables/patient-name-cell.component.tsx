import { ConfigurableLink } from '@openmrs/esm-framework';
import React from 'react';
import { Patient } from '../hooks/useLabManifestOrders';

type Props = {
  patient?: Patient;
};

const PatientNameCell: React.FC<Props> = ({ patient }) => {
  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/Patient Summary';
  const { display, uuid: patientUuid } = patient ?? {};
  if (!patient) {
    return <>--</>;
  }
  return (
    <ConfigurableLink
      to={patientChartUrl}
      templateParams={{ patientUuid: patientUuid }}
      style={{ textDecoration: 'none' }}>
      {display}
    </ConfigurableLink>
  );
};

export default PatientNameCell;
