import React from 'react';
import { useCodedConceptObservations } from './relationships.resource';

const ConceptObservations: React.FC<{ patientUuid; conceptUuid }> = ({ patientUuid, conceptUuid }) => {
  const { observations } = useCodedConceptObservations(patientUuid, conceptUuid);
  const concatenatedList = observations?.map((o) => o.value).join(', ');

  if (observations?.length) {
    return <span>{concatenatedList}</span>;
  }

  return <p>--</p>;
};

export default ConceptObservations;
