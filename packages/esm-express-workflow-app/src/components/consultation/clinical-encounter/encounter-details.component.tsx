import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatetime, parseDate, useConfig, ErrorState, ExtensionSlot } from '@openmrs/esm-framework';
import { CardHeader, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button, TabsSkeleton } from '@carbon/react';
import {
  CloudMonitoring,
  IbmWatsonDiscovery,
  Dashboard,
  Stethoscope,
  Add,
  Edit,
  DocumentMultiple_02,
} from '@carbon/react/icons';

import { extractValueFromObs, useClinicalEncounterForm, usePatientEncounter } from '../../../hooks/usePatientEncounter';
import styles from './encounter-details.scss';
import { type Observation } from '../../../types';
import { ExpressWorkflowConfig } from '../../../config-schema';

type EncounterDetailsProps = {
  patientUuid: string;
  patient?: fhir.Patient;
};

const EncounterDetails: React.FC<EncounterDetailsProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const state = useMemo(() => ({ patientUuid, patient, basePath: 'clinical-encounter' }), [patientUuid, patient]);
  const {
    clinicalEncounter: { encounterTypeUuid },
  } = useConfig<ExpressWorkflowConfig>();
  const { encounters, isLoading, error, mutate } = usePatientEncounter(patientUuid, encounterTypeUuid);
  const { conceptLabelMap } = useClinicalEncounterForm();

  const lastEncounter = useMemo(() => {
    return encounters?.sort(
      (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
    )[0];
  }, [encounters]);

  // This maps to the different sections of the clinical encounter form
  const observationsBySection = useMemo(() => {
    const sections = {
      'Visit Details': [],
      'Patient History': [],
      'Patient Examination': [],
      'Patient Management': [],
    };

    if (!lastEncounter?.obs || !conceptLabelMap) {
      return sections;
    }

    lastEncounter.obs.forEach((obs) => {
      const conceptUuid = obs.concept.uuid;

      Object.keys(sections).forEach((sectionName) => {
        if (conceptLabelMap[sectionName]?.[conceptUuid]) {
          sections[sectionName].push({
            title: conceptLabelMap[sectionName][conceptUuid],
            value: extractValueFromObs(obs as Observation),
          });
        }
      });
    });

    return sections;
  }, [lastEncounter, conceptLabelMap]);

  if (isLoading) {
    return <TabsSkeleton contained />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('encounterDetails', 'Encounter Details')} />;
  }

  return (
    <div className={styles.encounterDetails}>
      <Tabs>
        <TabList contained>
          <Tab renderIcon={Dashboard}>{t('visitDetails', 'Visit Details')}</Tab>
          <Tab renderIcon={CloudMonitoring}>{t('patientHistory', 'Patient History')}</Tab>
          <Tab renderIcon={Stethoscope}>{t('patientExamination', 'Patient Examination')}</Tab>
          <Tab renderIcon={IbmWatsonDiscovery}>{t('patientManagement', 'Patient Management')}</Tab>
          <Tab renderIcon={DocumentMultiple_02}>{t('labResults', 'Lab Results')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <EncounterCard
              encounterUuid={lastEncounter?.uuid}
              title={t('visitDetails', 'Visit Details')}
              mutateForm={mutate}
              cardItems={[
                {
                  title: t('visitDate', 'Visit Date'),
                  value: formatDatetime(parseDate(lastEncounter?.encounterDatetime), { mode: 'wide', noToday: true }),
                },
                { title: t('visitType', 'Visit Type'), value: lastEncounter?.encounterType?.display },
                { title: t('visitLocation', 'Visit Location'), value: lastEncounter?.location?.display },
                {
                  title: t('visitProvider', 'Visit Provider'),
                  value: lastEncounter?.encounterProviders?.[0]?.provider?.display,
                },
                ...(observationsBySection['Visit Details'] || []),
              ]}
            />
          </TabPanel>
          <TabPanel>
            <EncounterCard
              encounterUuid={lastEncounter?.uuid}
              mutateForm={mutate}
              title={t('patientHistory', 'Patient History')}
              cardItems={observationsBySection['Patient History'] || []}
            />
          </TabPanel>
          <TabPanel>
            <EncounterCard
              encounterUuid={lastEncounter?.uuid}
              mutateForm={mutate}
              title={t('patientExamination', 'Patient Examination')}
              cardItems={observationsBySection['Patient Examination'] || []}
            />
          </TabPanel>
          <TabPanel>
            <EncounterCard
              encounterUuid={lastEncounter?.uuid}
              mutateForm={mutate}
              title={t('patientManagement', 'Patient Management')}
              cardItems={observationsBySection['Patient Management'] || []}
            />
          </TabPanel>
          <TabPanel>
            <ExtensionSlot name="ewf-clinical-encounter-lab-results-slot" state={state} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default EncounterDetails;

type EncounterCardProps = {
  title: string;
  cardItems: Array<{ title: string; value: string }>;
  mutateForm: () => void;
  encounterUuid?: string;
};

const EncounterCard = ({ title, cardItems, mutateForm, encounterUuid }: EncounterCardProps) => {
  const { t } = useTranslation();
  const {
    clinicalEncounter: { formUuid },
  } = useConfig<ExpressWorkflowConfig>();
  const launchWorkspaceRequiringVisit = useLaunchWorkspaceRequiringVisit('patient-form-entry-workspace');

  const handleOpenOrEditClinicalEncounterForm = (encounterUuid?: string) => {
    launchWorkspaceRequiringVisit({
      workspaceTitle: title,
      mutateForm: mutateForm,
      formInfo: {
        encounterUuid: encounterUuid ?? '',
        formUuid: formUuid,
        additionalProps: {},
      },
    });
  };
  return (
    <div>
      <CardHeader title={title}>
        <div className={styles.cardHeaderButtons}>
          <Button renderIcon={Add} size="md" kind="ghost" onClick={() => handleOpenOrEditClinicalEncounterForm()}>
            {t('add', 'Add')}
          </Button>
          <Button
            renderIcon={Stethoscope}
            size="md"
            kind="ghost"
            onClick={() => handleOpenOrEditClinicalEncounterForm(encounterUuid)}>
            {t('continueWithCare', 'Continue with care')}
          </Button>
        </div>
      </CardHeader>
      <div className={styles.cardItems}>
        {cardItems.map((item) => (
          <CardItem key={item.title} title={item.title} value={item.value} />
        ))}
      </div>
    </div>
  );
};

const CardItem = ({ title, value }: { title: string; value: string }) => {
  return (
    <div className={styles.cardItem}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.value}>{value}</p>
    </div>
  );
};
