import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer } from '@carbon/react';
import { IbmWatsonDiscovery, Account, Stethoscope } from '@carbon/react/icons';
import ExtensionTabs, { ExtensionTabItem } from '../../../shared/tabs/extension-tabs.component';

type ClinicalEncounterProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const ClinicalEncounter: React.FC<ClinicalEncounterProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const state = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  const items: Array<ExtensionTabItem> = [
    { label: t('clinicalEncounter', 'Clinical Encounter'), icon: Stethoscope, slotName: 'ewf-clinical-encounter-slot' },
    { label: t('visits', 'Visits'), icon: Account, slotName: 'ewf-visits-slot' },
    { label: t('specialClinics', 'Special Clinics'), icon: IbmWatsonDiscovery, slotName: 'ewf-special-clinics-slot' },
  ];

  return (
    <Layer>
      <ExtensionTabs items={items} state={state} />
    </Layer>
  );
};

export default ClinicalEncounter;
