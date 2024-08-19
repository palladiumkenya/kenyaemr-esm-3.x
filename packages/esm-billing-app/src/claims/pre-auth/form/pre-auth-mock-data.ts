import { SHAPackage, Benefits, Intervention } from '../../../types';

export const benefits: Benefits[] = [
  {
    shaPackageCode: 'SHA-001',
    shaPackageName: 'Eye Care',
    shaInterventionCode: 'SHA-001-01',
    shaInterventionName: 'Intervention 1',
  },
  {
    shaPackageCode: 'SHA-002',
    shaPackageName: 'Malaria',
    shaInterventionCode: 'SHA-002-01',
    shaInterventionName: 'Intervention 2',
  },
];

export const mockPackages: SHAPackage[] = [
  {
    uuid: 'SHA-PKG-001',
    shaPackageCode: 'SHA-001',
    shaPackageName: 'Eye Care',
  },
  {
    uuid: 'SHA-PKG-002',
    shaPackageCode: 'SHA-002',
    shaPackageName: 'Dental Care',
  },
  {
    uuid: 'SHA-PKG-003',
    shaPackageCode: 'SHA-003',
    shaPackageName: 'Surgical',
  },
  {
    uuid: 'SHA-PKG-004',
    shaPackageCode: 'SHA-004',
    shaPackageName: 'Haemo-oncology',
  },
];

export const mockInterventions: Intervention[] = benefits.map(({ shaInterventionCode, shaInterventionName }) => ({
  shaInterventionCode,
  shaInterventionName,
}));
