import React from 'react';
import {
  ChartColumn,
  DocumentAdd,
  Events,
  Home,
  Medication,
  Receipt,
  Renew,
  User,
  VolumeFileStorage,
  Report,
  InventoryManagement,
  HospitalBed,
} from '@carbon/react/icons';
const openmrsSpaBase = window['getOpenmrsSpaBase']();

const handleClearCache = async () => {
  document.cookie.split(';').forEach((c) => {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
};

export const moduleLinks = [
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
    url: `https://odoosuperset.kenyahmis.org/superset/dashboard/11/`,
    icon: <ChartColumn size={24} />,
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
  },
  {
    label: 'Legacy Admin ',
    url: `/openmrs/index.htm`,
    icon: <User size={24} />,
  },
  {
    label: 'Manage Stocks ',
    url: `${openmrsSpaBase}stock-management`,
    icon: <Report size={24} />,
  },
  {
    label: 'Billing ',
    url: `${openmrsSpaBase}home/billing`,
    icon: <Receipt size={24} />,
  },
  {
    label: 'Cohort Builder ',
    url: `${openmrsSpaBase}cohort-builder`,
    icon: <Events size={24} />,
  },
  {
    label: 'Dispensing App',
    url: `${openmrsSpaBase}dispensing`,
    icon: <Medication size={24} />,
  },
  {
    label: 'Billable Services',
    url: `${openmrsSpaBase}billable-services`,
    icon: <InventoryManagement size={24} />,
    requiresAdmin: true,
  },
  {
    label: 'Bed Management',
    url: `${openmrsSpaBase}bed-management`,
    icon: <HospitalBed size={24} />,
    requiresAdmin: true,
  },
];
