export interface Package {
  uuid: string;
  shaPackageCode: string;
  shaPackageName: string;
  packageAccessPoint: 'OP' | 'IP' | 'Both';
}

export interface SHAintervention {
  shaInterventionCode: string;
  shaInterventionName?: string;
}

export const packages = [
  {
    shaPackageCode: 'SHA-001',
    shaPackageName: 'Eye Care',
    packageAccessPoint: 'OPD',
  },
  {
    shaPackageCode: 'SHA-002',
    shaPackageName: 'Dental Care',
    packageAccessPoint: 'IPD',
  },
  {
    shaPackageCode: 'SHA-003',
    shaPackageName: 'Surgical',
    packageAccessPoint: 'OPD',
  },
  {
    shaPackageCode: 'SHA-004',
    shaPackageName: 'Haemo-oncology',
    packageAccessPoint: 'OP',
  },
] as Array<Package>;

export const interventions: SHAintervention[] = [
  { shaInterventionCode: 'SHA-001-01', shaInterventionName: 'Intervention 1' },
  { shaInterventionCode: 'SHA-001-02', shaInterventionName: 'Intervention 2' },
  { shaInterventionCode: 'SHA-001-03', shaInterventionName: 'Intervention 3' },
];
