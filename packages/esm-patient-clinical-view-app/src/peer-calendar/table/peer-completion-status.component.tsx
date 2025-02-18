import { Tag, TagSkeleton } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { ConfigObject } from '../../config-schema';
import useEncounters from '../../hooks/useEncounters';
import { Peer, ReportingPeriod } from '../../types';
import { getFirstAndLastDayOfMonth } from '../peer-calendar.resources';

type PeerCompletionStatusProps = {
  peer: Peer;
  reportingPeriod?: Partial<ReportingPeriod>;
  setCompletePeers?: React.Dispatch<React.SetStateAction<Array<string>>>;
  completePeers?: Array<string>;
};

const PeerCompletionStatus: React.FC<PeerCompletionStatusProps> = ({
  peer,
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

  const { encounters, error, isLoading, mutate } = useEncounters(peer.patientUuid, kpPeerCalender, from, to);

  useEffect(() => {
    mutate();
  }, [reportingPeriod, mutate]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (encounters.length > 0 && !completePeers.includes(peer.patientUuid)) {
      setCompletePeers([...completePeers, peer.patientUuid]);
    } else if (completePeers.includes(peer.patientUuid) && encounters.length < 1) {
      setCompletePeers(completePeers.filter((c) => c !== peer.patientUuid));
    }
  }, [encounters, completePeers, peer.patientUuid, setCompletePeers, isLoading]);

  if (isLoading) {
    return <TagSkeleton />;
  }
  const isCompleted = completePeers.includes(peer.patientUuid);
  return <Tag type={isCompleted ? 'green' : 'red'}>{isCompleted ? 'Complete' : 'Pending'}</Tag>;
};

export default PeerCompletionStatus;
