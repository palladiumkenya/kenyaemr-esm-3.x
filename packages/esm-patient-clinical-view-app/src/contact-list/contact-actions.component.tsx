import { Button, ButtonSkeleton, Row } from '@carbon/react';
import { Microscope, TrashCan } from '@carbon/react/icons';
import React from 'react';
import {
  getHivStatusBasedOnEnrollmentAndHTSEncounters,
  useRelativeHTSEncounter,
  useRelativeHivEnrollment,
} from './contact-list.resource';

interface ContactActionsProps {
  relativeUuid: string;
  baseLineHIVStatus: string | null;
}

const ContactActions: React.FC<ContactActionsProps> = ({ relativeUuid, baseLineHIVStatus }) => {
  const { enrollment, isLoading, error } = useRelativeHivEnrollment(relativeUuid);
  const { encounters, isLoading: encounterLoading } = useRelativeHTSEncounter(relativeUuid);

  if (isLoading || encounterLoading) {
    return (
      <Row>
        <ButtonSkeleton kind="tertiary" size="sm" hasIconOnly />
        <ButtonSkeleton kind="tertiary" size="sm" hasIconOnly />
      </Row>
    );
  }

  const hivStatus = getHivStatusBasedOnEnrollmentAndHTSEncounters(encounters, enrollment);

  return (
    <Row>
      {[hivStatus, baseLineHIVStatus].every((status) =>
        ['Unknown', 'Negative', 'NEGATIVE', 'UNKNOWN', null].includes(status),
      ) && <Button kind="tertiary" renderIcon={Microscope} iconDescription="Test" hasIconOnly />}
      <Button kind="tertiary" renderIcon={TrashCan} iconDescription="Delete Record" hasIconOnly />
    </Row>
  );
};

export default ContactActions;
