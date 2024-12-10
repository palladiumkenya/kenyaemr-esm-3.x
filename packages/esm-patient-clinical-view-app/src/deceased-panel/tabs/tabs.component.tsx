import React from 'react';
import styles from './tabs.scss';
import { launchWorkspace, navigate, useConfig, useVisit } from '@openmrs/esm-framework';
import { Tile, Button, Layer } from '@carbon/react';
import { Movement, Return } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import MortuarySummary from '../mortuary-summary/mortuary-summary.component';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../../config-schema';
import { usePatientDischargedStatus } from '../hook/useMorgueVisit';

const DeceasedDetailsView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const { morgueDischargeEncounterUuid, morgueVisitTypeUuid } = useConfig<ConfigObject>();
  const { status, isLoading, error } = usePatientDischargedStatus(patientUuid);

  const isVisitActive = !(typeof status?.stopDatetime === 'string');
  const hasDischargeEncounter = status?.encounters?.some(
    (encounter) => encounter.encounterType.uuid === morgueDischargeEncounterUuid,
  );

  const handleNavigateToAllocationPage = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/morgue/allocation`,
    });

  const handleDischargeForm = (uuid: string) => {
    launchWorkspace('discharge-body-form', {
      workspaceTitle: t('dischargeForm', 'Discharge form'),
      patientUuid: uuid,
    });
  };

  const isDischargeDisabled = hasDischargeEncounter && !isVisitActive;

  return (
    <div className={styles.deceasedDetailsContainer}>
      <Layer className={styles.container}>
        <Tile>
          <div className={styles.headingContainer}>
            <div className={styles.desktopHeading}>
              <h4>{t('mortuaryView', 'Mortuary view')}</h4>
            </div>
            <div className={styles.actionBtn}>
              <Button
                className={styles.rightButton}
                kind="secondary"
                size="sm"
                renderIcon={Return}
                onClick={handleNavigateToAllocationPage}>
                {t('allocation', 'Allocation View')}
              </Button>
              <Button
                className={styles.rightButton}
                kind="danger"
                size="sm"
                renderIcon={Movement}
                onClick={() => handleDischargeForm(patientUuid)}
                disabled={isDischargeDisabled}>
                {t('releaseBody', 'Release Body')}
              </Button>
            </div>
          </div>
        </Tile>

        <MortuarySummary />
      </Layer>
    </div>
  );
};

export default DeceasedDetailsView;
