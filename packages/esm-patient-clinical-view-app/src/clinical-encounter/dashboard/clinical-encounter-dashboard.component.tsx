import React from 'react';
import { useTranslation } from 'react-i18next';
import ClinicalEncounter from '../clinical-enc.component';
import SurgicalSummary from '../summary/surgical summary/surgical-summary.component';
import NeonatalSummary from '../summary/neonatal summary/neonatal-summary.component';
import {
  Activity,
  CloudMonitoring,
  Dashboard,
  Friendship,
  ReminderMedical,
  UserFollow,
  UserMultiple,
} from '@carbon/react/icons';
import { Layer, Tab, TabList, TabPanel, TabPanels, Tabs, Tile } from '@carbon/react';
import styles from './in-patient.scss';
import MaternalSummary from '../summary/maternal-summary/maternal-summary.component';
import InPatientSummary from '../summary/in-patient-medical-summary/in-patient-medical-summary.component';
import OutPatientSocialHistory from '../summary/out-patient-summary/patient-social-history.component';
import OutPatientMedicalHistory from '../summary/out-patient-summary/patient-medical-history.component';
import { useConfig, useVisit } from '@openmrs/esm-framework';
import { useClinicalEncounter } from '../../hooks/useClinicalEncounter';
import { ConfigObject } from '../../config-schema';
import {
  AdmissionDate_UUID,
  PriorityOfAdmission_UUID,
  AdmissionWard_UUID,
  ACCIDENT_TRAUMA_UUID,
  BLOOD_TRANSFUSION_UUID,
  SURGICAL_HISTORY_UUID,
  Alcohol_Use_UUID,
  Alcohol_Use_Duration_UUID,
  Smoking_UUID,
  Smoking_Duration_UUID,
  Other_Substance_Abuse_UUID,
} from '../../utils/constants';

interface ClinicalEncounterDashboardProps {
  patientUuid: string;
  encounterTypeUuid: string;
  formEntrySub: any;
}

const ClinicalEncounterDashboard: React.FC<ClinicalEncounterDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const isInPatient = currentVisit?.visitType?.display?.toLocaleLowerCase() === 'inpatient';
  const {
    clinicalEncounterUuid,
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();
  const config = useConfig() as ConfigObject;
  const { encounters, isLoading, error, mutate, isValidating } = useClinicalEncounter(
    clinicalEncounterUuid,
    clinicalEncounterFormUuid,
    patientUuid,
    [
      AdmissionDate_UUID,
      PriorityOfAdmission_UUID,
      ACCIDENT_TRAUMA_UUID,
      BLOOD_TRANSFUSION_UUID,
      SURGICAL_HISTORY_UUID,
      ACCIDENT_TRAUMA_UUID,
      BLOOD_TRANSFUSION_UUID,
      Alcohol_Use_UUID,
      Alcohol_Use_Duration_UUID,
      Smoking_UUID,
      Smoking_Duration_UUID,
      Other_Substance_Abuse_UUID,
      AdmissionWard_UUID,
    ],
  );
  return (
    <div>
      <Layer>
        <Tile>
          <div className={styles.desktopHeading}>
            <h4>{t('clinicalEncounter', 'Clinical encounter')}</h4>
          </div>
        </Tile>
      </Layer>
      <Layer style={{ backgroundColor: 'white', padding: '0 1rem' }}>
        <Tabs>
          <TabList contained activation="manual" aria-label="List of tabs">
            <Tab renderIcon={Friendship}>{t('socialHistory', 'Social History')}</Tab>
            <Tab renderIcon={ReminderMedical}>{t('medicalHistory', 'Medical History')}</Tab>
            {isInPatient && <Tab renderIcon={CloudMonitoring}>{t('encounterDetails', 'Encounter details')}</Tab>}
            {isInPatient && <Tab renderIcon={Activity}>{t('surgicalSummary', 'Surgical Summary')}</Tab>}
            {isInPatient && <Tab renderIcon={UserMultiple}>{t('neonatalSummary', 'Neonatal Summary')}</Tab>}
            {isInPatient && <Tab renderIcon={UserFollow}>{t('maternalSummary', 'Maternal Summary')}</Tab>}
            {isInPatient && <Tab renderIcon={Dashboard}>{t('inPatientSummary', 'In-Patient Summary')}</Tab>}
          </TabList>
          <TabPanels>
            <TabPanel>
              {
                <OutPatientSocialHistory
                  patientUuid={patientUuid}
                  encounters={encounters}
                  isLoading={isLoading}
                  error={error}
                  mutate={mutate}
                  isValidating={isValidating}
                />
              }
            </TabPanel>
            <TabPanel>
              {
                <OutPatientMedicalHistory
                  patientUuid={patientUuid}
                  encounters={encounters}
                  isLoading={isLoading}
                  error={error}
                  mutate={mutate}
                  isValidating={isValidating}
                />
              }
            </TabPanel>
            <TabPanel>
              {
                <ClinicalEncounter
                  patientUuid={patientUuid}
                  encounters={encounters}
                  isLoading={isLoading}
                  error={error}
                  mutate={mutate}
                  isValidating={isValidating}
                />
              }
            </TabPanel>
            <TabPanel>
              <SurgicalSummary
                patientUuid={patientUuid}
                encounters={encounters}
                isLoading={isLoading}
                error={error}
                mutate={mutate}
                isValidating={isValidating}
              />
            </TabPanel>
            <TabPanel>
              <NeonatalSummary patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel>
              <MaternalSummary patientUuid={patientUuid} />
            </TabPanel>
            <TabPanel>
              <InPatientSummary
                patientUuid={patientUuid}
                encounters={encounters}
                isLoading={isLoading}
                error={error}
                mutate={mutate}
                isValidating={isValidating}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Layer>
    </div>
  );
};
export default ClinicalEncounterDashboard;
