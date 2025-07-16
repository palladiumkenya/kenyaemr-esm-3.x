import { Layer, Tile } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './tabs.scss';
import MortuarySummary from '../view-details.component';

const DeceasedDetailsView: React.FC = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromStore();

  return (
    <div className={styles.deceasedDetailsContainer}>
      <Layer className={styles.container}>
        <Tile>
          <div className={styles.headingContainer}>
            <div className={styles.desktopHeading}>
              <h4>{t('mortuaryView', 'Mortuary view')}</h4>
            </div>
            <div className={styles.actionBtn}>
              <ExtensionSlot name="mortuary-action-buttons-slot" state={{ patientUuid }} />
            </div>
          </div>
        </Tile>

        <MortuarySummary />
      </Layer>
    </div>
  );
};

export default DeceasedDetailsView;
