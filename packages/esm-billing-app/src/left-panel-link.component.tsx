import { ConfigurableLink } from '@openmrs/esm-framework';
import last from 'lodash-es/last';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, useLocation } from 'react-router-dom';

export interface LinkConfig {
  name: string;
  title: string;
}

export function LinkExtension({ config }: { config: LinkConfig }) {
  const { t } = useTranslation();
  const { name, title } = config;
  const nameSegment = name.split('/').at(-1);
  const location = useLocation();
  const spaBasePath = window.getOpenmrsSpaBase() + 'home';

  let urlSegment = useMemo(() => {
    const rawSegment = last(location.pathname.split('/'));
    const decodedSegment = decodeURIComponent(rawSegment);
    return decodedSegment;
  }, [location.pathname]);

  const isUUID = (value: string) => {
    const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    const result = regex.test(value);
    return result;
  };

  if (isUUID(urlSegment)) {
    if (location.pathname.includes('payment-points')) {
      const newSegment = location.pathname.split('/').at(-2);
      urlSegment = newSegment;
    } else {
      const pathParts = location.pathname.split('/');
      const mainSectionIndex = pathParts.findIndex((part) => part === nameSegment);

      if (mainSectionIndex > -1) {
        urlSegment = nameSegment;
      } else {
        const containsOurSection =
          location.pathname.includes('/' + nameSegment + '/') || location.pathname.includes('/' + nameSegment);
        if (containsOurSection) {
          urlSegment = nameSegment;
        } else {
          urlSegment = '';
        }
      }
    }
  } else if (location.pathname.endsWith('claims') || location.pathname.endsWith('claims/')) {
    const containsOurSection =
      location.pathname.includes('/' + nameSegment + '/') || location.pathname.split('/').includes(nameSegment);
    if (containsOurSection) {
      urlSegment = nameSegment;
    } else {
      urlSegment = '';
    }
  }

  const isActive = nameSegment === urlSegment;
  const finalUrl = spaBasePath + '/' + name;

  return (
    <ConfigurableLink to={finalUrl} className={`cds--side-nav__link ${isActive && 'active-left-nav-link'}`}>
      {t(title)}
    </ConfigurableLink>
  );
}

export const createLeftPanelLink = (config: LinkConfig) => {
  return () => {
    return (
      <BrowserRouter>
        <LinkExtension config={config} />
      </BrowserRouter>
    );
  };
};
