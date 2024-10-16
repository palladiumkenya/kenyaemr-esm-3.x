export interface Package {
  uuid: string;
  packageCode: string;
  packageName: string;
  packageAccessPoint: 'OP' | 'IP' | 'Both';
}

export interface SHAintervention {
  interventionCode: string;
  interventionName?: string;
}

export const packages = [
  {
    packageCode: 'SHA-001',
    packageName: 'Eye Care',
    packageAccessPoint: 'OPD',
  },
  {
    packageCode: 'SHA-002',
    packageName: 'Dental Care',
    packageAccessPoint: 'IPD',
  },
  {
    packageCode: 'SHA-003',
    packageName: 'Surgical',
    packageAccessPoint: 'OPD',
  },
  {
    packageCode: 'SHA-004',
    packageName: 'Haemo-oncology',
    packageAccessPoint: 'OP',
  },
] as Array<Package>;

export const interventions: SHAintervention[] = [
  { interventionCode: 'SHA-001-01', interventionName: 'Intervention 1' },
  { interventionCode: 'SHA-001-02', interventionName: 'Intervention 2' },
  { interventionCode: 'SHA-001-03', interventionName: 'Intervention 3' },
];
