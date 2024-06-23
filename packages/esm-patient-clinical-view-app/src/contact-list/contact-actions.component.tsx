import { Button, ButtonSkeleton, Row } from '@carbon/react';
import { Edit, Microscope, TrashCan } from '@carbon/react/icons';
import React from 'react';
import {
  getHivStatusBasedOnEnrollmentAndHTSEncounters,
  useRelativeHTSEncounter,
  useRelativeHivEnrollment,
} from './contact-list.resource';

interface ContactActionsProps {
  relativeUuid: string;
}

const ContactActions: React.FC<ContactActionsProps> = ({ relativeUuid }) => {
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

  return (
    <Row>
      {['Unknown', 'Negative'].includes(getHivStatusBasedOnEnrollmentAndHTSEncounters(encounters, enrollment)) && (
        <Button kind="tertiary" renderIcon={Microscope} iconDescription="Test" hasIconOnly />
      )}
      <Button kind="tertiary" renderIcon={Edit} iconDescription="Edit Record" hasIconOnly />
      <Button kind="tertiary" renderIcon={TrashCan} iconDescription="Delete Record" hasIconOnly />
    </Row>
  );
};

export default ContactActions;
