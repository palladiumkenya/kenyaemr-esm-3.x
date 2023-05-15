import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const AboutLink = () => {
  const { t } = useTranslation();
  return <ConfigurableLink to={`\${openmrsSpaBase}/about`}>{t('systemInfo', 'System Info')}</ConfigurableLink>;
};

export default AboutLink;
