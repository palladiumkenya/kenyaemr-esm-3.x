import {
  ChartColumn,
  ChemistryReference,
  DashboardReference,
  DocumentAdd,
  Home,
  HospitalBed,
  IbmCloudGateKeeper,
  Medication,
  Receipt,
  Renew,
  Report,
  User,
  VolumeFileStorage,
  WatsonHealthCrossReference,
} from '@carbon/react/icons';
import { CalendarIcon, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { excludeLinks, instanceName } = useConfig<ConfigObject>();
  const moduleLinks = [
    {
      label: t('systemInfo', 'System Info'),
      url: `${openmrsSpaBase}about`,
      icon: <VolumeFileStorage size={24} />,
    },
    {
      label: t('instanceHomeLink', '{{instanceName}}Home', { instanceName }),
      url: `/openmrs/kenyaemr/userHome.page?`,
      icon: <Home size={24} />,
      privilege: 'o3: View KenyaEMR 2x Home Page',
    },
    {
      label: t('facilityDashboard', 'Facility Dashboard'),
      url: `${openmrsSpaBase}facility-dashboard`,
      icon: <ChartColumn size={24} />,
      privilege: 'o3: View Facility Dashboard',
    },
    {
      label: t('clearCache', 'Clear Cache'),
      icon: <Renew size={24} />,
      onClick: handleClearCache,
    },
    {
      label: t('formBuilder', 'Form Builder'),
      url: `${openmrsSpaBase}form-builder`,
      icon: <DocumentAdd size={24} />,
      privilege: 'o3: View Form Builder Dashboard',
    },
    {
      label: t('manageStocks', 'Manage Stocks'),
      url: `${openmrsSpaBase}stock-management`,
      icon: <Report size={24} />,
      privilege: 'o3: Manage Stocks',
    },
    {
      label: t('billingAdmin', 'Billing Admin'),
      url: `${openmrsSpaBase}billing-admin`,
      icon: <Receipt size={24} />,
      privilege: 'o3: View Billing Admin Dashboard',
    },
    {
      label: t('dispensingApp', 'Dispensing App'),
      url: `${openmrsSpaBase}dispensing`,
      icon: <Medication size={24} />,
      privilege: 'o3: View Dispensing Dashboard',
    },
    {
      label: t('suppliesDispensing', 'Supplies Dispensing'),
      url: `${openmrsSpaBase}supplies-dispensing`,
      icon: <Medication size={24} />,
      privilege: 'o3: View Dispensing Dashboard',
    },
    {
      label: t('labManifestApp', 'Lab Manifest App'),
      url: `${openmrsSpaBase}lab-manifest`,
      icon: <ChemistryReference size={24} />,
      privilege: 'o3: View Lab Manifest',
    },
    {
      label: t('bedManagement', 'Bed Management'),
      url: `${openmrsSpaBase}bed-management`,
      icon: <HospitalBed size={24} />,
      privilege: 'o3: View Bed Management Dashboard',
    },
    {
      label: t('administration', 'Administration'),
      url: `${openmrsSpaBase}admin`,
      icon: <User size={24} />,
      privilege: 'o3: View Administration Dashboard',
    },
    {
      label: t('crossBorder', 'Cross Border'),
      url: `${openmrsSpaBase}cross-border`,
      icon: <WatsonHealthCrossReference size={24} />,
      privilege: 'o3: View Cross Border Dashboard',
    },
    {
      label: t('adrAssessment', 'ADR Assessment'),
      url: `${openmrsSpaBase}adr-assessment`,
      icon: <WatsonHealthCrossReference size={24} />,
      privilege: 'o3: View ADR Assessment Dashboard',
    },
    {
      label: t('reports', 'Reports'),
      url: `/openmrs/kenyaemr/reports/reportsHome.page`,
      icon: <Report size={24} />,
      privilege: 'o3: View Reports',
    },
    {
      label: t('legacyAdmin', 'Legacy Admin'),
      url: `/openmrs/admin/index.htm`,
      icon: <IbmCloudGateKeeper size={24} />,
      privilege: 'o3: View Legacy Admin Dashboard',
    },
    {
      label: t('serviceQueuesAdmin', 'Service Queues Admin'),
      url: `${openmrsSpaBase}queues-admin`,
      icon: <IbmCloudGateKeeper size={24} />,
      privilege: 'o3: View Service Queues Admin Dashboard',
    },
    {
      label: t('referrals', 'Referrals'),
      url: `${openmrsSpaBase}referrals`,
      icon: <DashboardReference size={24} />,
      privilege: 'o3: View Referrals Dashboard',
    },
    {
      label: t('appointments', 'Appointments'),
      url: `${openmrsSpaBase}appointments`,
      icon: <CalendarIcon size={24} />,
      privilege: 'o3: View Appointments Dashboard',
    },
    {
      label: t('caseManagement', 'Case Management'),
      url: `${openmrsSpaBase}case-management`,
      icon: <DashboardReference size={24} />,
      privilege: 'o3: View Case Management Dashboard',
    },
    {
      label: t('queueScreen', 'Queue Screen'),
      url: `${openmrsSpaBase}queues-admin/screen`,
      icon: <IbmCloudGateKeeper size={24} />,
      privilege: 'o3: View Queue Screen Dashboard',
    },
  ];

  return moduleLinks.filter((link) => !excludeLinks.some((excludeLink) => excludeLink === link.label));
};
