import { Button, Loading, Tag, TagSkeleton } from '@carbon/react';
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
  reportingPeriod?: Partial<ReportingPeriod>;
};

export const PeerCalendarActions: React.FC<PeerCalendarActionsProps> = ({
  contact: { patientUuid },
  reportingPeriod,
}) => {
  const {
    formsList: { peerCalendarOutreactForm: formUuid },
  } = useConfig<ConfigObject>();
  const { t } = useTranslation();

  const {
    encounterTypes: { kpPeerCalender },
  } = useConfig<ConfigObject>();
  const timeStamp = new Date();

  const { firstDay, lastDay } = getFirstAndLastDayOfMonth(
    reportingPeriod?.month ?? timeStamp.getMonth() + 1,
    reportingPeriod?.year ?? timeStamp.getFullYear(),
  );
  const from = dayjs(firstDay).format('YYYY-MM-DD');
  const to = dayjs(firstDay).add(1, 'month').format('YYYY-MM-DD');

  const handleLauchPeerOutreachForm = (encounterUuid?: string) => {
    launchWorkspace('peer-calendar-form', {
      formUuid,
      patientUuid,
      encounterUuid: encounterUuid ?? '',
      encounterDatetime: lastDay?.toISOString() ?? '',
    });
  };

  const { encounters, error, isLoading, mutate } = useEncounters(patientUuid, kpPeerCalender, from, to);
  if (isLoading) {
    return <Loading withOverlay={false} small />;
  }
  return (
    <Button
      renderIcon={Launch}
      hasIconOnly
      iconDescription={t('launch', 'Launch outreact form')}
      kind="ghost"
      onClick={() => handleLauchPeerOutreachForm(encounters[0]?.uuid)}
    />
  );
};

type PeerCalendarStatusProps = {
  contact: Contact;
  reportingPeriod?: Partial<ReportingPeriod>;
  setCompletePeers?: React.Dispatch<React.SetStateAction<Array<string>>>;
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
  const isCompleted = completePeers.includes(contact.patientUuid);
  return <Tag type={isCompleted ? 'green' : 'red'}>{isCompleted ? 'Complete' : 'Pending'}</Tag>;
};
