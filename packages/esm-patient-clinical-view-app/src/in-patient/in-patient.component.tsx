import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import ClinicalEncounter from '../clinical-encounter/clinical-enc.component';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { Add } from '@carbon/react/icons';
import { Tile, Layer, Button } from '@carbon/react';
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
  const {
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();

  const handleOpenOrEditClinicalEncounterForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Clinical Encounter',
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid: clinicalEncounterFormUuid,
        patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
      },
    });
  };
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
              <CardHeader title={'Clinical Encounter View'}>
                <Button
                  size="md"
                  kind="ghost"
                  onClick={() => handleOpenOrEditClinicalEncounterForm()}
                  renderIcon={(props) => <Add size={24} {...props} />}
                  iconDescription="Add">
                  {t('add', 'Add')}
                </Button>
              </CardHeader>
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
