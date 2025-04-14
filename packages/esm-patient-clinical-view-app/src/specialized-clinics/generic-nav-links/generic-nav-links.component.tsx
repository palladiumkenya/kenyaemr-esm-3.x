import React, { useMemo } from 'react';
import last from 'lodash-es/last';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../../config-schema';
export const basePath = '${openmrsSpaBase}/patient/';

type GenericNavLinksProps = {};

const GenericNavLinks: React.FC<GenericNavLinksProps> = () => {
  const { specialClinics } = useConfig<ConfigObject>();
  return (
    <BrowserRouter>
      {specialClinics.map((clinic) => {
        return <GenericLink title={clinic.title} path={clinic.id} />;
      })}
    </BrowserRouter>
  );
};

export default GenericNavLinks;

const GenericLink: React.FC<{ title: string; path: string }> = (props) => {
  const location = useLocation();
  const patientUuid = getPatientUuidFromStore();
  const navLink = useMemo(() => decodeURIComponent(last(location.pathname.split('/'))), [location.pathname]);
  return (
    <ConfigurableLink
      style={{ paddingLeft: '1.5rem', fontWeight: 'bold' }}
      className={`cds--side-nav__link`}
      to={`${basePath}${patientUuid}/chart/${encodeURIComponent('special-clinics-dashboard')}?clinic=${props.path}`}>
      {props.title}
    </ConfigurableLink>
  );
};
