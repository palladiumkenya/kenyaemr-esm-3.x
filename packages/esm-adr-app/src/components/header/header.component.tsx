import React from 'react';
import { PageHeader, AppointmentsPictogram } from '@openmrs/esm-framework';

const Header: React.FC = () => {
  return <PageHeader title="ADR Assessment" illustration={<AppointmentsPictogram />} />;
};

export default Header;
