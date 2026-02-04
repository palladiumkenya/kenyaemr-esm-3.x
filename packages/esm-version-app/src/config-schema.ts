import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  defaultLogoPath: {
    _type: Type.String,
    _default: '/openmrs/spa/kenyaemr-login-logo_poweredby_kenyaemr.png',
    _description:
      'Path to the default facility logo (relative to SPA base), used when facility information has no logo.',
  },
};
