import { Button, InlineLoading, Layer, Tile } from '@carbon/react';
import { ArrowRight, Logout } from '@carbon/react/icons';
import { HomePictogram, PageHeader, showModal, showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ExpressWorkflowConfig } from '../../config-schema';
import { clearDashboardSession, decodeToken, getToken } from './dashboard.resources';
import styles from './dashboard.scss';
import { EmptyState } from '@openmrs/esm-patient-common-lib/src';
import { ChartBar } from '@carbon/pictograms-react';

const FacilityDashboard: React.FC = () => {
  const { supersetDashboardConfig } = useConfig<ExpressWorkflowConfig>();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { user } = useSession();
  const handleShowAuthorization = () => {
    const dispose = showModal('facility-dashboard-authorization-form-modal', { size: 'sm', onClose: () => dispose() });
  };
  const { userProperties } = user;
  const handleClearSesion = async () => {
    try {
      setLoading(true);
      await clearDashboardSession(user);
      showSnackbar({
        subtitle: t('sessionEndedSuccessfully', 'Session ended succesfull'),
        title: t('success', 'Success'),
        kind: 'success',
      });
    } catch (error) {
      showSnackbar({
        subtitle: error?.message,
        title: t('error', 'Error'),
        kind: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userProperties.dashboardAccessToken) {
      const payload = decodeToken(userProperties.dashboardAccessToken);
      const embed = async () => {
        await embedDashboard({
          id: supersetDashboardConfig.dashboardId, // given by the Superset embedding UI
          supersetDomain: supersetDashboardConfig.host,
          mountPoint: document.getElementById('superset-container'), // html element in which iframe render
          fetchGuestToken: () => getToken(payload.username, payload.password, supersetDashboardConfig),
          dashboardUiConfig: {
            hideTitle: true,
            hideChartControls: true,
            hideTab: true,
            filters: {
              expanded: false,
            },
          },
        });
      };
      if (document.getElementById('superset-container')) {
        embed();
      }
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.minHeight = '100vw';
      }
    } else {
      const supersetContainer = document.getElementById('superset-container');
      if (supersetContainer) {
        supersetContainer.innerHTML = '';
      }
    }
  }, [supersetDashboardConfig, userProperties]);
  return (
    <div>
      <PageHeader className={styles.pageHeader} title={t('dashboard', 'Dashboard')} illustration={<HomePictogram />} />
      {userProperties.dashboardAccessToken ? (
        <div className={styles.actions}>
          <Button size="xs" renderIcon={Logout} onClick={handleClearSesion} disabled={loading}>
            {loading ? (
              <InlineLoading description={t('loading', 'Loading') + '...'} />
            ) : (
              t('endDashboardsession', 'End Dashboard session')
            )}
          </Button>
        </div>
      ) : (
        <Layer className={styles.empty}>
          <ChartBar />
          <p>{t('pleaseAuthorizeToViewDashboard', 'Please authorize to view dashboard')}</p>
          <Button kind="ghost" renderIcon={ArrowRight} onClick={handleShowAuthorization}>
            {t('authorize', 'Authorize')}
          </Button>
        </Layer>
      )}
      <div id="superset-container"></div>
    </div>
  );
};

export default FacilityDashboard;
