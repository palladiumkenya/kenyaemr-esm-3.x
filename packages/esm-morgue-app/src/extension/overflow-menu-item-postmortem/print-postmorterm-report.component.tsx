import React from 'react';
import { OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showModal, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../../config-schema';
import { useAutospyEncounter } from '../../view-details/view-details.resource';
import { usePerson } from '../../deceased-patient-header/deceasedInfo/deceased-info.resource';

interface PrintPostMortemOverflowMenuItemProps {
  patientUuid?: string;
}
const PrintPostMortemOverflowMenuItem: React.FC<PrintPostMortemOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { autopsyEncounterFormUuid } = useConfig<ConfigObject>();

  const { encounters, isLoading, error, mutate, isValidating } = useAutospyEncounter(
    patientUuid,
    autopsyEncounterFormUuid,
  );

  const handlePrintPostmortem = () => {
    const dispose = showModal('autopsy-report-modal', {
      onClose: () => dispose(),
      encounters: encounters,
      patientUuid,
    });
  };
  return (
    <>
      <OverflowMenuItem
        onClick={() => handlePrintPostmortem()}
        itemText={t('printPostMortemReport', 'Postmortem Report')}
        disabled={isLoading || !encounters?.length}
      />
    </>
  );
};

export default PrintPostMortemOverflowMenuItem;
