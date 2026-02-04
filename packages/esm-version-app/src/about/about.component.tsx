import React, { useMemo } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import { formatDatetime, useConfig } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';
import { Phone, Email, Location, Globe, WarningAlt } from '@carbon/react/icons';

import styles from './about.scss';
import { useModules, useGlobalProperty } from '../hooks/useModules';
import FrontendModule from '../frontend-modules/frontend-modules.component';
import type { FacilityContacts, FacilityInformation } from '../types';

const packageInfo = require('../release-version.js');

function parseFacilityInformation(value: unknown): FacilityInformation | null {
  if (value == null) {
    return null;
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as FacilityInformation;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as FacilityInformation;
    } catch {
      return null;
    }
  }

  return null;
}

interface FacilityHeaderProps {
  facilityName: string;
  taglineText?: string;
  logoSrc: string;
  titleClassName: string;
  taglineClassName: string;
  logoAlt: string;
}

const FacilityHeader: React.FC<FacilityHeaderProps> = ({
  facilityName,
  taglineText,
  logoSrc,
  titleClassName,
  taglineClassName,
  logoAlt,
}) => (
  <div className={titleClassName}>
    <img src={logoSrc} alt={logoAlt} width="300" height="100" />
    <div>
      <h3>{facilityName}</h3>
      {taglineText ? <p className={taglineClassName}>{taglineText}</p> : null}
    </div>
  </div>
);

interface FacilityContactsProps {
  contacts?: FacilityContacts;
  contactsClassName: string;
  contactItemClassName: string;
  t: TFunction;
}

const FacilityContactsSection: React.FC<FacilityContactsProps> = ({
  contacts,
  contactsClassName,
  contactItemClassName,
  t,
}) => {
  if (
    !contacts ||
    (!contacts.tel && !contacts.email && !contacts.emergency && !contacts.address && !contacts.website)
  ) {
    return null;
  }

  return (
    <div className={contactsClassName}>
      {contacts.tel && (
        <div className={contactItemClassName}>
          <Phone size={16} />
          <span>{contacts.tel}</span>
        </div>
      )}
      {contacts.email && (
        <div className={contactItemClassName}>
          <Email size={16} />
          <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
        </div>
      )}
      {contacts.emergency && (
        <div className={contactItemClassName}>
          <WarningAlt size={16} />
          <span>
            {t('emergency', 'Emergency')}: {contacts.emergency}
          </span>
        </div>
      )}
      {contacts.address && (
        <div className={contactItemClassName}>
          <Location size={16} />
          <span>{contacts.address}</span>
        </div>
      )}
      {contacts.website && (
        <div className={contactItemClassName}>
          <Globe size={16} />
          <a
            href={contacts.website.startsWith('http') ? contacts.website : `https://${contacts.website}`}
            target="_blank"
            rel="noopener noreferrer">
            {contacts.website}
          </a>
        </div>
      )}
    </div>
  );
};

interface VersionDetailsProps {
  kenyaEmrVersion?: string;
  spaVersion: string;
  buildDate: Date;
  aboutBodyClassName: string;
  t: TFunction;
}

const VersionDetails: React.FC<VersionDetailsProps> = ({
  kenyaEmrVersion,
  spaVersion,
  buildDate,
  aboutBodyClassName,
  t,
}) => (
  <div className={aboutBodyClassName}>
    <p>{t('mainModuleVersion', 'Main Module Version')}</p>
    <p>{`v${kenyaEmrVersion ?? '—'}`}</p>
    <p>{t('spaVersion', 'SPA Version')}</p>
    <p>{`v${spaVersion}`}</p>
    <p>{t('buildDateTime', 'Build date time')}</p>
    <p>{formatDatetime(buildDate, { mode: 'standard' })}</p>
  </div>
);

interface AboutProps {}

const About: React.FC<AboutProps> = () => {
  const { t } = useTranslation();
  const { modules } = useModules();
  const { defaultLogoPath } = useConfig();
  const { data: facilityInformation, isLoading: isFacilityInformationLoading } = useGlobalProperty(
    'kenyaemr.cashier.receipt.facilityInformation',
  );

  const kenyaEmrModule = modules.find(({ uuid }) => uuid === 'kenyaemr');
  const { title, container, aboutBody, aboutPage, tagline, contacts, contactItem } = styles;
  const { VERSION } = packageInfo;

  const facility = useMemo(() => parseFacilityInformation(facilityInformation?.['value']), [facilityInformation]);

  if (isFacilityInformationLoading) {
    return <InlineLoading description={t('loadingFacilityInformation', 'Loading facility information...')} />;
  }

  const contactsData = facility?.contacts;

  const facilityName = facility?.facilityName ?? 'Ministry of Health';
  const facilityTagline = facility?.tagline;
  const logoAlt = facility?.facilityName ?? t('facilityLogo', 'Facility logo');

  const spaVersion = VERSION.version;
  const buildDate = new Date(VERSION.buildDate);
  const kenyaEmrVersion = kenyaEmrModule?.version;

  return (
    <div className={styles.main}>
      <div className={aboutPage}>
        <div className={container}>
          <FacilityHeader
            facilityName={facilityName}
            taglineText={facilityTagline}
            logoSrc={defaultLogoPath}
            titleClassName={title}
            taglineClassName={tagline}
            logoAlt={logoAlt}
          />

          <FacilityContactsSection
            contacts={contactsData}
            contactsClassName={contacts}
            contactItemClassName={contactItem}
            t={t}
          />

          <VersionDetails
            kenyaEmrVersion={kenyaEmrVersion}
            spaVersion={spaVersion}
            buildDate={buildDate}
            aboutBodyClassName={aboutBody}
            t={t}
          />
        </div>
      </div>
      <div className={styles.frontendModules}>
        <FrontendModule />
      </div>
    </div>
  );
};

export default About;
