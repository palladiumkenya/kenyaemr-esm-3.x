import React from 'react';
import { RelationshipsTab } from './tabs/relationships-tabs-component';

interface RelationshipsProps {
  patientUuid: string;
}

const Relationships: React.FC<RelationshipsProps> = ({ patientUuid }) => {
  return (
    <>
      <RelationshipsTab patientUuid={patientUuid} />
    </>
  );
};

export default Relationships;
