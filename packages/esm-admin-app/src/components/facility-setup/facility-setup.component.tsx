import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Button, MenuItem, InlineLoading } from '@carbon/react';
import styles from './facility-setup.scss';
import FacilityInfo from './facility-info.component';
import Header from './header/header.component';
import { showSnackbar } from '@openmrs/esm-framework';

const FacilitySetup: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [logData, setLogData] = useState<Array<any>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const synchronize = async () => {
    try {
    } catch (e) {
      showSnackbar({ title: 'Synchronizing Error', kind: 'error', subtitle: e });
    }
  };
  return (
    <div className="omrs-main-content">
      <Header title="Facility Setup" />

      <Layer className={styles.tableLayer}>
        <FacilityInfo />
      </Layer>
    </div>
  );
};

export default FacilitySetup;

//  const syncResponse = useDefaultFacility();
//       if (syncResponse?.defaultFacility) {
//         showSnackbar({
//           title: t('syncedWithHie', 'Synced with HIE Successfully'),
//           kind: 'success',
//           isLowContrast: true,
//         });
//       } else {
//         showSnackbar({
//           title: t('syncingWithHieFailed', 'Syncing with HIE Failed'),
//           subtitle: hieresponse.error,
//           kind: 'error',
//           isLowContrast: true,
//         });
//       }
