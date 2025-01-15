import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Button, MenuItem, InlineLoading } from '@carbon/react';
import styles from './facility-setup.scss';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import FacilitySetupHeader from './header/facility-setup-header.component';
import FrontendModule from './facility-info.component';

const FacilitySetup: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [logData, setLogData] = useState<Array<any>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="omrs-main-content">
      <FacilitySetupHeader title={t('facilitySetupTitle', 'Facility Setup')} />
      <Layer className={styles.btnLayer}>
        {isLoading ? (
          <InlineLoading
            description={t('synchronizingFacilityData', 'Please wait, Synchronizing Info.')}
            size="md"
            className={styles.loading}
            withOverlay
          />
        ) : (
          <Button kind="secondary" onClick={close}>
            {t('synchronizeInfo', 'Synchronize Info')}
          </Button>
        )}
      </Layer>
      <Layer className={styles.tableLayer}>
        {/* <LogTable logData={logData} isLoading={isRefreshing} /> */}
        <FrontendModule />
      </Layer>
    </div>
  );
};

export default FacilitySetup;
