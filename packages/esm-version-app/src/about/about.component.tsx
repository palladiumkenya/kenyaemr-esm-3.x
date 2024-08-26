import React, { useEffect } from 'react';
import styles from './about.scss';
import { useModules } from '../hooks/useModules';
import { useDefaultFacility, useSystemSetting } from '../hooks/useSystemSetting';
import { formatDate, formatDatetime, showNotification } from '@openmrs/esm-framework';
import FrontendModule from '../frontend-modules/frontend-modules.component';
import { SkeletonText } from '@carbon/react';
import dayjs from 'dayjs';
const packageInfo = require('../release-version.js');

interface AboutProps {}

const About: React.FC<AboutProps> = () => {
  const { modules, isLoading } = useModules();
  const kenyaEMR = modules.find(({ uuid }) => uuid === 'kenyaemr');
  const { mflCodeResource } = useSystemSetting('facility.mflcode');
  const mflCode = mflCodeResource ? `(${mflCodeResource?.value ?? ''})` : '';
  const { title, container, aboutBody, aboutPage } = styles;
  const { VERSION } = packageInfo;
  const { defaultFacility, error, isLoading: defaultFacilityLoading } = useDefaultFacility();

  useEffect(() => {
    if (!defaultFacility) {
      return;
    }
    // Uncomment when dates are availed
    /*if (!dayjs(defaultFacility?.shaFacilityExpiryDate).isValid()) {
      showNotification({ kind: 'error', title: 'Error', description: 'Invalid SHA accreditation expiry date' });
      return;
    }
    if (dayjs(defaultFacility?.shaFacilityExpiryDate).isBefore(dayjs())) {
      showNotification({ kind: 'error', title: 'Error', description: 'SHA accreditation Licence has expired' });
    }*/
    if (defaultFacility?.operationalStatus !== 'Operational') {
      showNotification({ kind: 'error', title: 'Error', description: 'The facility SHA status is is not operational' });
    }
  }, [defaultFacility]);

  return (
    <div className={styles.main}>
      <div className={aboutPage}>
        <div className={container}>
          <div className={title}>
            <div>
              <h3>Government of Kenya</h3>
              <h4>Ministry of Health</h4>
            </div>
            <img
              src="/openmrs/ms/uiframework/resource/kenyaemr/images/logos/moh.png"
              alt="court_of_arms"
              width="50"
              height="50"
            />
          </div>
          <div className={aboutBody}>
            <p>KenyaEMR Version</p>
            <p>{`v${kenyaEMR?.version}`}</p>
            <p>SPA Version</p>
            <p>{`v${VERSION.version}`}</p>
            <p>Build date time</p>
            <p>{formatDatetime(new Date(VERSION.buildDate), { mode: 'standard' })}</p>
            <p>Facility code</p>
            <p>{mflCode ?? '--'}</p>
            <p>Facility Name</p>
            {defaultFacilityLoading ? <SkeletonText /> : <p>{defaultFacility?.display ?? '--'}</p>}
            <p>Operational status</p>
            {defaultFacilityLoading ? <SkeletonText /> : <p>{defaultFacility?.operationalStatus ?? '--'}</p>}
            <p>Sha Contracted</p>
            {defaultFacilityLoading ? <SkeletonText /> : <p>--</p>}
            <p>Expiry Date</p>
            {defaultFacilityLoading ? <SkeletonText /> : <p>{defaultFacility?.shaFacilityExpiryDate ?? '--'}</p>}
          </div>
        </div>
      </div>
      <FrontendModule />
    </div>
  );
};

export default About;
