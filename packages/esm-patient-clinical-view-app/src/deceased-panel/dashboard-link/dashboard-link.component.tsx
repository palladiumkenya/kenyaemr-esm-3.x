import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import usePatient from '../hook/usepatient';
import classNames from 'classnames';

const DeceasedPanelDashboardLink = () => {
  const patientUuid = getPatientUuidFromUrl();
  const { patient, isLoading } = usePatient(patientUuid);
  const url = `\${openmrsSpaBase}/patient/${patientUuid}/chart/deceased-panel`;

  if (isLoading) {
    return null;
  }

  if (patient?.person?.dead) {
    return (
      <ConfigurableLink className={classNames('cds--side-nav__link', 'active-left-nav-link')} to={url}>
        Deceased Panel
      </ConfigurableLink>
    );
  }

  return null;
};

export default DeceasedPanelDashboardLink;
