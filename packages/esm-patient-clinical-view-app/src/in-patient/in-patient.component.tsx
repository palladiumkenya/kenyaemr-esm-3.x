import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import ClinicalEncounter from '../clinical-encounter/clinical-enc.component';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { Add } from '@carbon/react/icons';
import { Tile, Layer } from '@carbon/react';
import styles from './in-patient.scss';
interface InpatientProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
}
const InPatientView: React.FC<InpatientProps> = ({ patientUuid, encounterTypeUuid }) => {
  const { t } = useTranslation();
  const {
    formsList: { defaulterTracingFormUuid },
  } = useConfig<ConfigObject>();
  const headerTitle = t('inPatient', 'In-Patient');
  return (
    <>
      <Layer>
        <Tile>
          <div className={styles.desktopHeading}>
            <h4>In Patient Views</h4>
          </div>
        </Tile>
      </Layer>
      <div className={styles.cardContainer}>
        <div className={styles.tilesContainer}>
          <Layer>
            <Tile>
              <div className={styles.desktopHeading}>
                <h4>Clinical Encounter View</h4>
              </div>
              <ClinicalEncounter encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />
            </Tile>
          </Layer>
        </div>
        <div className={styles.tilesContainer}>
          <Layer>
            <Tile>
              <div className={styles.desktopHeading}>
                <h4>Bed Management</h4>
              </div>
              {/*<ClinicalEncounter encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />*/}
            </Tile>
          </Layer>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <div>
          <Layer>
            <Tile>
              <div className={styles.desktopHeading}>
                <h4>In Patient Medical Summary</h4>
              </div>
              {/*<ClinicalEncounter encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />*/}
            </Tile>
          </Layer>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <div>
          <Layer>
            <Tile>
              <div className={styles.desktopHeading}>
                <h4>Surgical Summary</h4>
              </div>
              {/*<ClinicalEncounter encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />*/}
            </Tile>
          </Layer>
        </div>
      </div>
      <div className={styles.cardContainer}>
        <div>
          <Layer>
            <Tile>
              <div className={styles.desktopHeading}>
                <h4>Neonatal Summary</h4>
              </div>
              {/*<ClinicalEncounter encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />*/}
            </Tile>
          </Layer>
        </div>
      </div>
    </>
  );
};
export default InPatientView;
