import React from 'react';

type LabManifestStatusAggregateValueProps = {
  status?: Array<string>;
};

const LabManifestStatusAggregateValue: React.FC<LabManifestStatusAggregateValueProps> = ({ status = [] }) => {
  return <div>LabManifestStatusAggregateValue</div>;
};

export default LabManifestStatusAggregateValue;
