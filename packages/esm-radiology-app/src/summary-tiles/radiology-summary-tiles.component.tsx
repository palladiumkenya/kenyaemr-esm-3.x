import React from 'react';
import styles from './radiology-summary-tiles.scss';
import { AssignedExtension, useConnectedExtensions, Extension } from '@openmrs/esm-framework';
import { ComponentContext } from '@openmrs/esm-framework/src/internal';

const RadiologySummaryTiles: React.FC = () => {
  const radiologyTileSlot = 'radiology-tiles-slot';

  const tilesExtensions = useConnectedExtensions(radiologyTileSlot) as AssignedExtension[];

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
                  extensionSlotName: radiologyTileSlot,
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

export default RadiologySummaryTiles;
