import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './make-claims.scss';
import { Button } from '@carbon/react';
import { Report } from '@carbon/react/icons';

const MakeClaims: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Button
      kind="secondary"
      className={styles.button}
      size="md"
      renderIcon={(props) => <Report size={24} {...props} />}>
      {t('makeclaims', 'Make Claims')}
    </Button>
  );
};

export default MakeClaims;
