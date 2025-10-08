import { Tabs, TabList, Tab, TabPanels, TabPanel, Layer, Checkbox, Button, TextInput } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DefaulterTracing from './defaulter-tracing/defaulter-tracing.component';
import HivTestingEncountersList from './hiv-testing-services/views/hiv-testing/hiv-testing-services.component';
import { ExtensionSlot } from '@openmrs/esm-framework';

type HivCareAndTreatmentProps = {
  patientUuid: string;
};

const HivCareAndTreatment = ({ patientUuid }: HivCareAndTreatmentProps) => {
  const { t } = useTranslation();
  return (
    <Layer>
      <Tabs>
        <TabList contained>
          <Tab>{t('defaulterTracing', 'Defaulter Tracing')}</Tab>
          <Tab>{t('hts', 'HIV Testing Services')}</Tab>
          <Tab>{t('hivPatientSummary', 'HIV Patient Summary')}</Tab>
          <Tab>{t('caseManagement', 'Case Management')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <DefaulterTracing patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <HivTestingEncountersList patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <ExtensionSlot name="hiv-patient-summary-slot" state={{ patientUuid }} />
          </TabPanel>
          <TabPanel>
            <ExtensionSlot name="ewf-case-management-slot" state={{ patientUuid }} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layer>
  );
};

export default HivCareAndTreatment;
