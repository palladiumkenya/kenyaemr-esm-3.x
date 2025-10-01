import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';

export interface PartographLinkProps {
  patientUuid: string;
}

const PartographLink: React.FC<PartographLinkProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  return (
    <ConfigurableLink
      to={`\${openmrsSpaBase}/patient/\${patientUuid}/chart/partography`}
      templateParams={{ patientUuid }}>
      {t('partography', 'Partography')}
    </ConfigurableLink>
  );
};

export default PartographLink;
