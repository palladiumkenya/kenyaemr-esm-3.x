import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { usePerson } from '../../../../esm-morgue-app/src/hook/useMorgue.resource';

const DeceasedPanelDashboardLink = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromStore();
  const { person, isLoading } = usePerson(patientUuid);
  const url = `\${openmrsSpaBase}/patient/${patientUuid}/chart/deceased-panel`;

  if (isLoading) {
    return null;
  }

  if (person?.dead) {
    return (
      <ConfigurableLink className={classNames('cds--side-nav__link', 'active-left-nav-link')} to={url}>
        {t('mortuaryDetails', 'Mortuary details')}
      </ConfigurableLink>
    );
  }

  return null;
};

export default DeceasedPanelDashboardLink;
