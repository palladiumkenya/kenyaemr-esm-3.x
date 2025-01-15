import React from 'react';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';
import { useFrontendModules } from '../hook/useFrontendModules';
import { useDefaultFacility, useSystemSetting } from '../hook/useSystemSetting';
import styles from './facility-info.scss';

const FacilityInfo: React.FC = () => {
  const installedModules = useFrontendModules();
  const { defaultFacility, error, isLoading: defaultFacilityLoading } = useDefaultFacility();
  const { mflCodeResource } = useSystemSetting('facility.mflcode');
  const mflCode = mflCodeResource ? `(${mflCodeResource?.value ?? ''})` : '';
  let facilityData = {
    mflCode: mflCode || 'N/A',
    shaStatus: 'N/A',
    name: defaultFacility?.display || 'N/A',
    kephLevel: 'N/A',
    operationalStatus: defaultFacility?.operationalStatus || 'N/A',
    shaContracted: defaultFacility?.shaContracted || 'N/A',
    expiryDate: defaultFacility?.shaFacilityExpiryDate || 'N/A',
    location1: 'N/A',
    location2: 'N/A',
  };
  return (
    <div className={styles.bottomBorder}>
      <StructuredListWrapper>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>Property</StructuredListCell>
            <StructuredListCell head>Value</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>

        <StructuredListBody>
          <StructuredListRow>
            <StructuredListCell>Facility Name</StructuredListCell>
            <StructuredListCell>{facilityData.name || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>Facility KMHFR Code</StructuredListCell>
            <StructuredListCell>{facilityData.mflCode || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>Keph Level</StructuredListCell>
            <StructuredListCell>{facilityData.kephLevel || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>Operational Status</StructuredListCell>
            <StructuredListCell>{facilityData.operationalStatus || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>SHA Status</StructuredListCell>
            <StructuredListCell>{facilityData.shaStatus || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>SHA Contracted</StructuredListCell>
            <StructuredListCell>{facilityData.shaContracted || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>SHA Expiry Date</StructuredListCell>
            <StructuredListCell>{facilityData.expiryDate || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>Location 1</StructuredListCell>
            <StructuredListCell>{facilityData.location1 || 'N/A'}</StructuredListCell>
          </StructuredListRow>
          <StructuredListRow>
            <StructuredListCell>Location 2</StructuredListCell>
            <StructuredListCell>{facilityData.location2 || 'N/A'}</StructuredListCell>
          </StructuredListRow>
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
};

export default FacilityInfo;
