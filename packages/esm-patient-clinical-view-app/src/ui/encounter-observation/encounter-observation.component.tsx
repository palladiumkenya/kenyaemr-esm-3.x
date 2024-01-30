import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import styles from './encounter-observation-component.scss';
import { mapConceptToFormLabel, mapObsValueToFormLabel } from '../encounter-list/encounter-list-utils';
import { Observation } from '../../types';

interface EncounterObservationsProps {
  observations: Array<Observation>;
  formConceptMap: object;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations, formConceptMap }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();

  if (!observations) {
    return <SkeletonText data-testid="skeleton-text" />;
  }

  if (observations?.length > 0) {
    const filteredObservations = !!obsConceptUuidsToHide.length
      ? observations?.filter((obs) => {
          return !obsConceptUuidsToHide.includes(obs?.concept?.uuid);
        })
      : observations;
    return (
      <div className={styles.observation}>
        {filteredObservations?.map((obs, parentIndex) => {
          if (obs.groupMembers) {
            return (
              <React.Fragment key={parentIndex}>
                <span className={styles.parentConcept}>{obs.concept.display ?? 'Group'}</span>
                <span />
                {obs.groupMembers.map((member, childIndex) => (
                  <React.Fragment key={childIndex}>
                    <span className={styles.childConcept}>
                      {mapConceptToFormLabel(member?.concept?.uuid, formConceptMap, member.concept.display)}
                    </span>
                    <span>
                      {mapObsValueToFormLabel(member?.concept?.uuid, member.value.uuid, formConceptMap, member.display)}
                    </span>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={parentIndex}>
                <span className={styles.questionText}>
                  {mapConceptToFormLabel(obs?.concept?.uuid, formConceptMap, obs?.concept?.name.name)}
                </span>
                <span>{mapObsValueToFormLabel(obs?.concept?.uuid, obs?.value?.uuid, formConceptMap, obs?.value)}</span>
              </React.Fragment>
            );
          }
        })}
      </div>
    );
  }

  return (
    <div className={styles.observation}>
      <p>{t('noObservationsFound', 'No observations found')}</p>
    </div>
  );
};

export default EncounterObservations;
