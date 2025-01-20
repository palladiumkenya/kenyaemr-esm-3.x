import React, { useEffect, useState } from 'react';
import { Tile, Grid, Column, Layer, InlineLoading, Button } from '@carbon/react';
import { useFacilityInfo } from '../hook/useFacilityInfo';
import styles from './facility-info.scss';
import { useTranslation } from 'react-i18next';
import { showNotification, showSnackbar } from '@openmrs/esm-framework';
import { FacilityData } from '../../types';

const FacilityInfo: React.FC = () => {
  const { t } = useTranslation();
  const [shouldSynchronize, setshouldSynchronize] = useState<boolean>(false);
  const { defaultFacility, isLoading: defaultFacilityLoading, error, refetch } = useFacilityInfo(shouldSynchronize);

  const [facilityData, setFacilityData] = useState<FacilityData>(defaultFacility);

  const synchronizeFacilityData = async () => {
    try {
      setshouldSynchronize(true);
      await refetch();
      showSnackbar({
        title: t('syncingHieSuccess', 'Synchronization Complete'),
        kind: 'success',
        isLowContrast: true,
      });
      if (defaultFacility?.source != 'HIE') {
        showNotification({
          kind: 'error',
          title: 'Error',
          description: 'HIE Sync Failed. Pulling local info.',
        });
      }
    } catch (error) {
      const errorMessage = error?.responseBody?.error?.message ?? 'An error occurred while synchronizing with HIE';
      showSnackbar({
        title: t('syncingHieError', 'Syncing with HIE Failed'),
        subtitle: errorMessage,
        kind: 'error',
        isLowContrast: true,
      });
    }
  };

  return (
    <div className={styles.facilityInfoContainer}>
      <div>
        <Layer className={styles.btnLayer}>
          {defaultFacilityLoading ? (
            <InlineLoading
              description={t('synchronizingFacilityData', 'Please wait, Synchronizing Info.')}
              size="md"
              className={styles.loading}
              withOverlay
            />
          ) : (
            <Button kind="primary" onClick={synchronizeFacilityData}>
              {t('synchronizeWithHie', 'Synchronize with HIE')}
            </Button>
          )}
        </Layer>
      </div>

      <Grid narrow>
        {/* General Info Column */}
        <Column sm={4} md={4} lg={8}>
          <Tile className={styles.card}>
            <h3 className={styles.cardTitle}>General Information</h3>
            <hr className={styles.cardDivider} />
            <div className={styles.cardContent}>
              <p>
                <strong>Facility Name:</strong> {facilityData?.display || 'N/A'}
              </p>
              <p>
                <strong>Facility KMHFR Code:</strong> {facilityData?.mflCode}
              </p>
              <p>
                <strong>Keph Level:</strong> {facilityData?.shaKephLevel}
              </p>
              <br />
              <br />
            </div>
          </Tile>
        </Column>

        {/* SHA Info Column */}
        <Column sm={4} md={4} lg={8}>
          <Layer>
            <Tile className={styles.card}>
              <h3 className={styles.cardTitle}>SHA Information</h3>
              <hr className={styles.cardDivider} />
              <div className={styles.cardContent}>
                <p>
                  <strong>Facility Registry Code:</strong> {facilityData?.shaFacilityId}
                </p>
                <p>
                  <strong>SHA License Number:</strong> {facilityData?.shaFacilityLicenseNumber}
                </p>
                <p>
                  <strong>SHA Status:</strong> {facilityData?.operationalStatus}
                </p>
                <p>
                  <strong>SHA Contracted:</strong> {facilityData?.shaContracted}
                </p>
                <p>
                  <strong>SHA Expiry Date:</strong> {facilityData?.shaFacilityExpiryDate}
                </p>
              </div>
            </Tile>
          </Layer>
        </Column>
      </Grid>
    </div>
  );
};

export default FacilityInfo;
