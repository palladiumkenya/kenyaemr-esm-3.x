import { Button, Column, Grid, InlineLoading, Layer, Tile } from '@carbon/react';
import { formatDate, parseDate, showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDefaultFacility, useShaFacility } from '../hook/useFacilityInfo';
import styles from './facility-info.scss';

const FacilityInfo: React.FC = () => {
  const { t } = useTranslation();
  const [shouldSynchronize, setshouldSynchronize] = useState<boolean>(false);
  const {
    shaFacility,
    isLoading: isShaFacilityLoading,
    error: shaFacilityError,
    mutate: mutateShafacility,
  } = useShaFacility(shouldSynchronize);
  const {
    defaultFacility,
    isLoading: isDefaultFacilityLoading,
    mutate: mutateDefaultFacility,
    error: defaultFacilityError,
  } = useDefaultFacility();
  const mutateFacility = useCallback(async () => {
    const defaultFacility = await mutateDefaultFacility();
    const shaFacility = await mutateShafacility();
    return {
      shaFacility,
      defaultFacility,
    };
  }, [mutateDefaultFacility, mutateShafacility]);

  const synchronizeFacilityData = async () => {
    try {
      setshouldSynchronize(true);
      const { shaFacility } = await mutateFacility();
      showSnackbar({
        title: t('syncingHieSuccess', 'Synchronization Complete'),
        kind: 'success',
        isLowContrast: true,
      });
      if (shaFacility.data?.source != 'HIE') {
        showSnackbar({
          kind: 'warning',
          title: 'HIE Sync Failed. Pulling local info.',
          isLowContrast: true,
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
          {isShaFacilityLoading || isDefaultFacilityLoading ? (
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
                <strong>Facility Name:</strong> {defaultFacility?.display}
              </p>
              <p>
                <strong>Facility KMHFR Code:</strong> {shaFacility?.mflCode}
              </p>
              <p>
                <strong>Keph Level:</strong> {shaFacility?.kephLevel}
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
                  <strong>Facility Registry Code:</strong> {shaFacility?.shaFacilityId}
                </p>
                <p>
                  <strong>SHA License Number:</strong> {shaFacility?.shaFacilityLicenseNumber}
                </p>
                <p>
                  <strong>SHA Status:</strong>{' '}
                  {shaFacility?.operationalStatus
                    ? `${shaFacility.operationalStatus.at(0).toUpperCase()}${shaFacility.operationalStatus
                        .slice(1)
                        ?.toLocaleLowerCase()}`
                    : '--'}
                </p>
                <p>
                  <strong>SHA Contracted:</strong> {shaFacility?.approved}
                </p>
                <p>
                  <strong>SHA Expiry Date:</strong>{' '}
                  {shaFacility?.shaFacilityExpiryDate ? formatDate(parseDate(shaFacility.shaFacilityExpiryDate)) : '--'}
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
