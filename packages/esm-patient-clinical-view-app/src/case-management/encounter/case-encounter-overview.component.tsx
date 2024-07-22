import React from 'react';
import { mapEncounters, useInfiniteVisits } from './case-encounter.resource';
import { importDynamic } from '@openmrs/esm-framework';
const VisitTable = React.lazy(() => importDynamic('@openmrs/esm-patient-chart-app').then((mod) => mod.VisitTable));

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
    <VisitTable mutateVisits={mutateVisits} visits={visitsWithEncounters} showAllEncounters patientUuid={patientUuid} />
  );
}

export default VisitDetailOverviewComponent;
