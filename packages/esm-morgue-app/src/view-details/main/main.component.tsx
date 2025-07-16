import React from 'react';
import { useParams } from 'react-router-dom';
import { Layer, Tile } from '@carbon/react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './main.scss';
import MortuarySummary from '../view-details.component';
import Header from '../../header/header.component';

const DeceasedDetailsView: React.FC = () => {
  const { patientUuid, bedNumber } = useParams<{ patientUuid: string; bedNumber?: string }>();

  return (
    <>
      <Header title="Mortuary chart" />
      <div className={styles.deceasedDetailsContainer}>
        <Layer className={styles.container}>
          <Tile>
            <div className={styles.headingContainer}>
              <div className={styles.desktopHeading}>
                <h4>Mortuary view</h4>
              </div>
              <div className={styles.actionBtn}>
                <ExtensionSlot name="mortuary-action-buttons-slot" state={{ patientUuid }} />
              </div>
            </div>
          </Tile>
          <MortuarySummary bedNumber={bedNumber} />
        </Layer>
      </div>
    </>
  );
};

export default DeceasedDetailsView;
