import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, navigate, UserHasAccess } from '@openmrs/esm-framework';
import { Movement, Return, ShareKnowledge } from '@carbon/react/icons';
import React from 'react';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import styles from './actionButton.scss';

interface ActionButtonProps {
  patientUuid: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { admissionLocation, isLoading, error } = useAdmissionLocation();

  const isPatientInAdmissionLocation = admissionLocation?.bedLayouts?.some((bed) =>
    bed.patients.some((patient) => patient.uuid === patientUuid),
  );

  const bedId = admissionLocation?.bedLayouts?.find((bed) =>
    bed.patients.some((patient) => patient.uuid === patientUuid),
  )?.bedId;

  const personUuid = admissionLocation?.bedLayouts
    ?.find((bed) => bed.patients.some((patient) => patient.uuid === patientUuid))
    ?.patients.find((patient) => patient.uuid === patientUuid)?.person?.uuid;

  const handleNavigateToAllocationPage = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/morgue/allocation`,
    });

  const handleDischargeForm = (uuid: string, bedId: number) => {
    launchWorkspace('discharge-body-form', {
      workspaceTitle: t('dischargeForm', 'Discharge form'),
      patientUuid: uuid,
      bedId,
      personUuid,
    });
  };

  const handleSwapForm = (uuid: string, bedId: number) => {
    launchWorkspace('swap-unit-form', {
      workspaceTitle: t('swapCompartment', 'Swap compartment'),
      patientUuid: uuid,
      bedId,
    });
  };

  return (
    <div className={styles.actionButton}>
      <UserHasAccess privilege="o3 : View Mortuary Dashboard">
        <Button kind="primary" size="sm" renderIcon={Return} onClick={handleNavigateToAllocationPage}>
          {t('allocation', 'Allocation View')}
        </Button>
      </UserHasAccess>

      {isPatientInAdmissionLocation && (
        <>
          <UserHasAccess privilege="o3: Swap Mortuary Compartments">
            <Button
              kind="secondary"
              size="sm"
              renderIcon={ShareKnowledge}
              onClick={() => handleSwapForm(patientUuid, bedId)}>
              {t('swapCompartment', 'Swap compartment')}
            </Button>
          </UserHasAccess>

          <UserHasAccess privilege="o3: Discharge Body from Mortuary">
            <Button
              kind="danger"
              size="sm"
              renderIcon={Movement}
              onClick={() => handleDischargeForm(patientUuid, bedId)}>
              {t('discharge', 'Discharge body')}
            </Button>
          </UserHasAccess>
        </>
      )}
    </div>
  );
};

export default ActionButton;
