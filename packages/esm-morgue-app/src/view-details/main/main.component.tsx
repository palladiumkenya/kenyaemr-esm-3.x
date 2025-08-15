import React from 'react';
import { useParams } from 'react-router-dom';
import { InlineLoading, Layer, Tile } from '@carbon/react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import styles from './main.scss';
import MortuarySummary from '../view-details.component';
import Header from '../../header/header.component';
import PatientBanner from '../../deceased-banner/deceased-banner.component';

const DeceasedDetailsView: React.FC = () => {
  const { patientUuid, bedNumber } = useParams<{ patientUuid: string; bedNumber?: string }>();
  const { patient, isLoading, error } = usePatient(patientUuid);
  if (isLoading) {
    return (
      <div>
        <InlineLoading description="Loading patient data..." />
      </div>
    );
  }

  return (
    <>
      <div className={styles.deceasedDetailsContainer}>
        <PatientBanner patientUuid={patientUuid} patient={patient} />
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
