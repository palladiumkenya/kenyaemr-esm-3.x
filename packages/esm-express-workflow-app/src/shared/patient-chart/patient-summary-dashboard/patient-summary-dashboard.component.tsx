import React, { useMemo } from 'react';
import { Layer, Grid, Column } from '@carbon/react';
import {
  CloudMonitoring,
  Activity,
  IbmWatsonDiscovery,
  Settings,
  Dashboard,
  Calendar,
  Attachment,
  GraphicalDataFlow,
} from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './patient-summary-dashboard.scss';
import ExtensionTabs, { ExtensionTabItem } from '../../tabs/extension-tabs.component';

type PatientSummaryDashboardProps = {
  patientUuid: string;
  patient: fhir.Patient;
};

const PatientSummaryDashboard: React.FC<PatientSummaryDashboardProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();

  const state = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  const items: Array<ExtensionTabItem> = [
    {
      label: t('patientSummary', 'Patient Summary'),
      icon: Dashboard,
      slotName: 'ewf-patient-summary-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('vitalsAndAnthropometric', 'Vitals & Anthropometric'),
      icon: Activity,
      slotName: 'ewf-vitals-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('carePanel', 'Care Panel'),
      icon: CloudMonitoring,
      slotName: 'ewf-care-panel-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('immunizations', 'Immunizations'),
      icon: IbmWatsonDiscovery,
      slotName: 'ewf-immunizations-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('relationships', 'Relationships'),
      icon: Settings,
      slotName: 'ewf-relationships-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('appointments', 'Appointments'),
      icon: Calendar,
      slotName: 'ewf-appointments-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('attachments', 'Attachments'),
      icon: Attachment,
      slotName: 'ewf-attachments-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
    {
      label: t('partograph', 'Partograph'),
      icon: GraphicalDataFlow,
      slotName: 'maternal-and-child-health-partograph-slot',
      slotClassName: styles.ewfExtensionSlot,
    },
  ];

  return (
    <Layer>
      <Grid condensed>
        <Column lg={16} md={8} sm={4}>
          <ExtensionTabs items={items} state={state} />
        </Column>
      </Grid>
    </Layer>
  );
};

export default PatientSummaryDashboard;
