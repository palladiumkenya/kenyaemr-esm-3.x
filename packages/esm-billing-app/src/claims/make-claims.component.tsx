import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './make-claims.scss';
import { Button } from '@carbon/react';
import { Report } from '@carbon/react/icons';
import { navigate } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';

const MakeClaims: React.FC<{ patientUuid: string; billUuid: string }> = ({ patientUuid, billUuid }) => {
  const { t } = useTranslation();

  const navigateToCreateClaimScreen = () => {
    navigate({ to: `${spaBasePath}/billing/patient/${patientUuid}/${billUuid}/claims` });
  };

  return (
    <Button
      kind="secondary"
      className={styles.button}
      size="md"
      renderIcon={(props) => <Report size={24} {...props} />}
      onClick={navigateToCreateClaimScreen}>
      {t('makeclaims', 'Make Claims')}
    </Button>
  );
};

export default MakeClaims;
