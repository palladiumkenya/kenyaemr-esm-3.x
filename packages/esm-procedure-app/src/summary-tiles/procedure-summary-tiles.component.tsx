import React from 'react';
import styles from './procedure-summary-tiles.scss';
import { AssignedExtension, useConnectedExtensions, Extension } from '@openmrs/esm-framework';
import { ComponentContext } from '@openmrs/esm-framework/src/internal';

const ProcedureSummaryTiles: React.FC = () => {
  const ProcedureTileSlot = 'procedure-tiles-slot';

  const tilesExtensions = useConnectedExtensions(ProcedureTileSlot) as AssignedExtension[];

  return (
    <div className={styles.cardContainer}>
      {tilesExtensions
        .filter((extension) => Object.keys(extension.meta).length > 0)
        .map((extension) => {
          return (
            <ComponentContext.Provider
              key={extension.id}
              value={{
                featureName: extension.meta.featureName,
                moduleName: extension.moduleName,
                extension: {
                  extensionId: extension.id,
                  extensionSlotName: ProcedureTileSlot,
                  extensionSlotModuleName: extension.moduleName,
                },
              }}>
              <Extension />
            </ComponentContext.Provider>
          );
        })}
    </div>
  );
};

export default ProcedureSummaryTiles;
