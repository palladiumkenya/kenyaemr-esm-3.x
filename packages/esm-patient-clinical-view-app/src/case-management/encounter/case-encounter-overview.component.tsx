import React from 'react';
import { Button, InlineLoading, Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, parseDate, useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import VisitsTable from './case-encounter-table.component';
import styles from './visit-detail-overview.scss';
import { mapEncounters, useInfiniteVisits } from './case-encounter.resource';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const { visits, mutateVisits } = useInfiniteVisits(patientUuid);

  const visitsWithEncounters = visits
    ?.filter((visit) => visit?.encounters?.length)
    ?.flatMap((visitWithEncounters) => {
      return mapEncounters(visitWithEncounters);
    });

  return (
    <VisitsTable
      mutateVisits={mutateVisits}
      visits={visitsWithEncounters}
      showAllEncounters
      patientUuid={patientUuid}
    />
  );
}

export default VisitDetailOverviewComponent;
