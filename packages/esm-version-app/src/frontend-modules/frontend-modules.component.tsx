import React from 'react';
import { useFrontendModules } from '../hooks/useFrontendModules';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
} from '@carbon/react';

const FrontendModule: React.FC = () => {
  const installedModules = useFrontendModules();
  return (
    <StructuredListWrapper ariaLabel="Structured list">
      <StructuredListHead>
        <StructuredListRow head tabIndex={0}>
          <StructuredListCell head>Module name</StructuredListCell>
          <StructuredListCell head>Version</StructuredListCell>
        </StructuredListRow>
      </StructuredListHead>
      <StructuredListBody>
        {installedModules.map((module) => (
          <StructuredListRow tabIndex={0}>
            <StructuredListCell>{module.name}</StructuredListCell>
            <StructuredListCell>{module.version ?? 'No version found'} </StructuredListCell>
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default FrontendModule;
