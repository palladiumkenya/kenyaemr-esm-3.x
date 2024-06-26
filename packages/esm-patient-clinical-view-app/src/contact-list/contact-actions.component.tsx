import { Button, ButtonSkeleton, Row } from '@carbon/react';
import { Microscope, TrashCan } from '@carbon/react/icons';
import React from 'react';
import {
  getHivStatusBasedOnEnrollmentAndHTSEncounters,
  useRelativeHTSEncounter,
  useRelativeHivEnrollment,
} from './contact-list.resource';
import { launchPatientChartWithWorkspaceOpen, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

interface ContactActionsProps {
  relativeUuid: string;
  baseLineHIVStatus: string | null;
}

const ContactActions: React.FC<ContactActionsProps> = ({ relativeUuid, baseLineHIVStatus }) => {
  const { enrollment, isLoading, error } = useRelativeHivEnrollment(relativeUuid);
  const { encounters, isLoading: encounterLoading } = useRelativeHTSEncounter(relativeUuid);

  const {
    formsList: { htsInitialTest },
  } = useConfig<ConfigObject>();

  if (isLoading || encounterLoading) {
    return (
      <Row>
        <ButtonSkeleton kind="tertiary" size="sm" hasIconOnly />
        <ButtonSkeleton kind="tertiary" size="sm" hasIconOnly />
      </Row>
    );
  }

  const hivStatus = getHivStatusBasedOnEnrollmentAndHTSEncounters(encounters, enrollment);
  const handleLauchHTSInitialForm = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'HTS Initial form',
      formInfo: { encounterUuid: '9c0a7a57-62ff-4f75-babe-5835b0e921b7', formUuid: htsInitialTest },
    });
  };

  return (
    <Row>
      {[hivStatus, baseLineHIVStatus].every((status) =>
        ['Unknown', 'Negative', 'NEGATIVE', 'UNKNOWN', null].includes(status),
      ) && (
        <Button
          kind="tertiary"
          renderIcon={Microscope}
          iconDescription="Test"
          hasIconOnly
          onClick={handleLauchHTSInitialForm}
        />
      )}
      <Button kind="tertiary" renderIcon={TrashCan} iconDescription="Delete Record" hasIconOnly />
    </Row>
  );
};

export default ContactActions;
