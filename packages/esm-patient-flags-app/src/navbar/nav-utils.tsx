import React from 'react';
import {
  ChartColumn,
  DocumentAdd,
  Home,
  Medication,
  Receipt,
  Renew,
  User,
  VolumeFileStorage,
  Report,
  InventoryManagement,
  HospitalBed,
  ChemistryReference,
  IbmCloudant,
  WatsonHealthCrossReference,
} from '@carbon/react/icons';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
const openmrsSpaBase = window['getOpenmrsSpaBase']();

const handleClearCache = async () => {
  document.cookie.split(';').forEach((c) => {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
};

export const useModuleLinks = () => {
  const config = useConfig<ConfigObject>();
  return [
    {
      label: 'System Info',
      url: `${openmrsSpaBase}about`,
      icon: <VolumeFileStorage size={24} />,
    },
    {
      label: 'KenyaEMR Home',
      url: `/openmrs/kenyaemr/userHome.page?`,
      icon: <Home size={24} />,
    },
    {
      label: 'Facility Dashboard ',
      url: config.facilityDashboardUrl,
      icon: <ChartColumn size={24} />,
      privilege: 'o3: View Facility Dashboard',
    },
    {
      label: 'Clear Cache',
      icon: <Renew size={24} />,
      onClick: handleClearCache,
    },
    {
      label: 'Form Builder ',
      url: `${openmrsSpaBase}form-builder`,
      icon: <DocumentAdd size={24} />,
      privilege: 'o3: View Form Builder Dashboard',
    },
    {
      label: 'Legacy Admin ',
      url: `/openmrs/index.htm`,
      icon: <User size={24} />,
      privilege: 'coreapps.systemAdministration',
    },
    {
      label: 'Manage Stocks ',
      url: `${openmrsSpaBase}stock-management`,
      icon: <Report size={24} />,
      privilege: 'o3: Manage Stocks',
    },
    {
      label: 'Billing ',
      url: `${openmrsSpaBase}home/billing`,
      icon: <Receipt size={24} />,
      privilege: 'o3: View Bill Payment Dashboard',
    },
    {
      label: 'Dispensing App',
      url: `${openmrsSpaBase}dispensing`,
      icon: <Medication size={24} />,
      privilege: 'o3: View Dispensing Dashboard',
    },
    {
      label: 'Supplies Dispensing',
      url: `${openmrsSpaBase}supplies-dispensing`,
      icon: <Medication size={24} />,
      privilege: 'o3: View Dispensing Dashboard',
    },
    {
      label: 'Lab Manifest App',
      url: `${openmrsSpaBase}home/lab-manifest`,
      icon: <ChemistryReference size={24} />,
      privilege: 'o3: View Lab Manifest',
    },
    {
      label: 'Bed Management',
      url: `${openmrsSpaBase}bed-management`,
      icon: <HospitalBed size={24} />,
      privilege: 'o3: View Bed Management Dashboard',
    },
    {
      label: 'ETL Administration',
      url: `${openmrsSpaBase}admin`,
      icon: <IbmCloudant size={24} />,
      privilege: 'o3: View ETL Administration Dashboard',
    },
    {
      label: 'Cross Border',
      url: `${openmrsSpaBase}cross-border`,
      icon: <WatsonHealthCrossReference size={24} />,
      privilege: 'o3: View Cross Border Dashboard',
    },
  ];
};
