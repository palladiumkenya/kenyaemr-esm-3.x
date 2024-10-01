import { Button, Tag, TagSkeleton } from '@carbon/react';
import { Launch } from '@carbon/react/icons';
import { launchWorkspace, useConfig } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../../config-schema';
import useEncounters from '../../hooks/useEncounters';
import { Contact, ReportingPeriod } from '../../types';
import { getFirstAndLastDayOfMonth } from '../peer-calendar.resources';

type PeerCalendarActionsProps = {
  contact: Contact;
};

export const PeerCalendarActions: React.FC<PeerCalendarActionsProps> = ({ contact: { patientUuid } }) => {
  const {
    formsList: { peerCalendarOutreactForm: formUuid },
  } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const handleLauchPeerOutreachForm = () => {
    launchWorkspace('peer-calendar-form', {
      formUuid,
      patientUuid,
      encounterUuid: '',
    });
  };
  return (
    <Button
      renderIcon={Launch}
      hasIconOnly
      iconDescription={t('launch', 'Launch outreact form')}
      kind="ghost"
      onClick={handleLauchPeerOutreachForm}
    />
  );
};

type PeerCalendarStatusProps = {
  contact: Contact;
  reportingPeriod?: Partial<ReportingPeriod>;
  setCompletePeers?: React.Dispatch<React.SetStateAction<string[]>>;
  completePeers?: Array<string>;
};

export const PeerCalendarStatus: React.FC<PeerCalendarStatusProps> = ({
  contact,
  reportingPeriod,
  completePeers = [],
  setCompletePeers,
}) => {
  const {
    encounterTypes: { kpPeerCalender },
    formsList: { peerCalendarOutreactForm },
  } = useConfig<ConfigObject>();
  const timeStamp = new Date();

  const { firstDay } = getFirstAndLastDayOfMonth(
    reportingPeriod?.month ?? timeStamp.getMonth() + 1,
    reportingPeriod?.year ?? timeStamp.getFullYear(),
  );
  const from = dayjs(firstDay).format('YYYY-MM-DD');
  const to = dayjs(firstDay).add(1, 'month').format('YYYY-MM-DD');

  const { encounters, error, isLoading, mutate } = useEncounters(contact.patientUuid, kpPeerCalender, from, to);

  useEffect(() => {
    mutate();
  }, [reportingPeriod]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (encounters.length > 0 && !completePeers.includes(contact.patientUuid)) {
      setCompletePeers([...completePeers, contact.patientUuid]);
    } else if (completePeers.includes(contact.patientUuid) && encounters.length < 1) {
      setCompletePeers(completePeers.filter((c) => c !== contact.patientUuid));
    }
  }, [encounters]);

  if (isLoading) {
    return <TagSkeleton />;
  }
  return (
    <Tag type={completePeers.includes(contact.patientUuid) ? 'green' : 'red'}>
      {completePeers.includes(contact.patientUuid) ? 'Complete' : 'Pending'}
    </Tag>
  );
};
