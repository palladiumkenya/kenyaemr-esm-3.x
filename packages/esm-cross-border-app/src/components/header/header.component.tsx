import React from 'react';
import { PageHeader, AppointmentsPictogram } from '@openmrs/esm-framework';

const Header: React.FC = () => {
  return <PageHeader title="Cross Border" illustration={<AppointmentsPictogram />} />;
};

export default Header;
