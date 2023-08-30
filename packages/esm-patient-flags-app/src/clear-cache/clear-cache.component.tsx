import React from 'react';
import { Button, Switcher } from '@carbon/react';
import { Renew } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './clear-cache.scss';

const ClearCacheButton: React.FC = () => {
  const { t } = useTranslation();
  const handleClearCache = async () => {
    // 1. Clear Cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // 2. Clear Local Storage
    localStorage.clear();

    // 3. Clear Session Storage
    sessionStorage.clear();

    window.location.reload();
  };
  return (
    <Switcher aria-label="Switcher Container">
      <Button
        className={styles.clearCacheButton}
        renderIcon={Renew}
        onClick={handleClearCache}
        style={{ margin: ' 0 0.25rem' }}>
        {t('reloadAndClearCache', 'Reload & Clear Cache')}
      </Button>
    </Switcher>
  );
};

export default ClearCacheButton;
