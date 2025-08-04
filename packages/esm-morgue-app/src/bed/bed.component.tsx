import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { convertDateToDays } from '../utils/utils';
import { useVisit } from '@openmrs/esm-framework';
import styles from './bed.scss';
import { PatientCardProps } from '../types';
import { usePatientContext } from '../context/deceased-person-context';
import DeceasedPatientCardHeader from './components/deceased-patient-card-header.component';
import DeceasedPatientInfo from './components/deceased-patient-info.component';
import DeceasedPatientStatusFooter from './components/deceased-patient-status-footer.component';
import { getOriginalPatient } from '../helpers/expression-helper';
const BedCard: React.FC<PatientCardProps> = ({
  patient,
  showActions = {
    admit: false,
    discharge: false,
    postmortem: false,
    swapCompartment: false,
    printGatePass: false,
    viewDetails: false,
  },
}) => {
  const { t } = useTranslation();
  const { activeVisit } = useVisit(patient.uuid);
  const { onAdmit, onPostmortem, onDischarge, onSwapCompartment, onPrintGatePass, onViewDetails } = usePatientContext();

  const lengthOfStay = activeVisit?.startDatetime
    ? convertDateToDays(activeVisit.startDatetime)
    : calculateDaysInMortuary(patient.person.deathDate);

  const isAdmitted = !!activeVisit;
  const timeSpentTagType: 'red' | 'magenta' | 'green' =
    lengthOfStay > 7 ? 'red' : lengthOfStay > 3 ? 'magenta' : 'green';

  function calculateDaysInMortuary(dateOfDeath: string): number {
    if (!dateOfDeath) {
      return 0;
    }
    const deathDate = new Date(dateOfDeath);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - deathDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'admit':
        // For admit action, we need to pass the original MortuaryPatient if available
        const originalPatient = getOriginalPatient(patient);
        if (originalPatient) {
          onAdmit?.(originalPatient);
        } else {
          onAdmit?.(patient);
        }
        break;
      case 'postmortem':
        onPostmortem?.(patient.uuid);
        break;
      case 'discharge':
        onDischarge?.(patient.uuid, patient.bedInfo?.bedId);
        break;
      case 'swapCompartment':
        onSwapCompartment?.(patient.uuid, patient.bedInfo?.bedId);
        break;
      case 'printGatePass':
        onPrintGatePass?.(patient, patient.encounterDate);
        break;
      case 'viewDetails':
        onViewDetails?.(patient.uuid, patient.bedInfo);
        break;
    }
  };

  return (
    <Layer className={`${styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <DeceasedPatientCardHeader patient={patient} showActions={showActions} onAction={handleAction} />
        <DeceasedPatientInfo patient={patient} />
        <DeceasedPatientStatusFooter
          patient={patient}
          isAdmitted={isAdmitted}
          lengthOfStay={lengthOfStay}
          timeSpentTagType={timeSpentTagType}
          activeVisit={activeVisit}
        />
      </Tile>
    </Layer>
  );
};

export default BedCard;
