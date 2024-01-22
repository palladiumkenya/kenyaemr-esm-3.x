import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import ClinicalEncounter from '../clinical-encounter/clinical-enc.component';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';
import { CardHeader, EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { Add } from '@carbon/react/icons';
import { Tile } from '@carbon/react';
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
    <Tile>
      <ClinicalEncounter encounterTypeUuid={encounterTypeUuid} patientUuid={patientUuid} />
    </Tile>
  );
};
export default InPatientView;
