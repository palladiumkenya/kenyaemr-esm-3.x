import React from 'react';
import styles from './tabs.scss';
import { navigate } from '@openmrs/esm-framework';
import { Tile, Button, Layer } from '@carbon/react';
import { Movement, Return, Delete, TrashCan } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import MortuarySummary from '../mortuary-summary/mortuary-summary.component';

const DeceasedDetailsView: React.FC = () => {
  const { t } = useTranslation();
  const handleNavigateToAllocationPage = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/morgue/allocation`,
    });
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
                className={styles.ghostButton}
                kind="ghost"
                size="sm"
                renderIcon={TrashCan}
                onClick={handleNavigateToAllocationPage}>
                {t('disposeBody', 'Dispose body')}
              </Button>

              <Button className={styles.rightButton} kind="danger" size="sm" renderIcon={Movement}>
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
