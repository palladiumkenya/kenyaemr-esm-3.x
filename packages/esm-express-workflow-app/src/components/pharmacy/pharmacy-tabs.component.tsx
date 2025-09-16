import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ExtensionTabs, { ExtensionTabItem } from '../../shared/tabs/extension-tabs.component';
import { Layer } from '@carbon/react';
import { Activity, CalendarTools } from '@carbon/react/icons';

type PharmacyTabsProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const PharmacyTabs: React.FC<PharmacyTabsProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const state = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  const items: Array<ExtensionTabItem> = [
    { label: t('activeMedications', 'Active Medications'), icon: Activity, slotName: 'ewf-active-medications-slot' },
    { label: t('pastMedications', 'Past Medications'), icon: CalendarTools, slotName: 'ewf-past-medications-slot' },
  ];

  return (
    <Layer>
      <ExtensionTabs items={items} state={state} />
    </Layer>
  );
};

export default PharmacyTabs;
