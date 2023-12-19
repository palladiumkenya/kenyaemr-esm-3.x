import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { Observation } from '../../src/type/types';
import styles from './encounter-observation-table.scss';
import { mapConceptToFormLabel, mapObsValueToFormLabel } from '../encounter-list/encounter-list-utils';

interface EncounterObservationsProps {
  observations: Array<Observation>;
  formConceptMap: object;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations, formConceptMap }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();
  function getAnswerFromDisplay(display: string): string {
    if (display == undefined) {
      return '';
    }
    const colonIndex = display.indexOf(':');
    if (colonIndex === -1) {
      return '';
    } else {
      return display.substring(colonIndex + 1).trim();
    }
  }

  if (!observations) {
    return <SkeletonText />;
  }

  if (observations) {
    const filteredObservations = !!obsConceptUuidsToHide.length
      ? observations?.filter((obs) => {
          return !obsConceptUuidsToHide.includes(obs?.concept?.uuid);
        })
      : observations;
    return (
      <div className={styles.observation}>
        {filteredObservations?.map((obs, index) => {
          if (obs.groupMembers) {
            return (
              <React.Fragment key={index}>
                <span className={styles.parentConcept}>{obs.concept.display ?? 'Group'}</span>
                <span />
                {obs.groupMembers.map((member) => (
                  <React.Fragment key={index}>
                    <span className={styles.childConcept}>
                      {mapConceptToFormLabel(member.concept.uuid, formConceptMap, member.concept.display)}
                    </span>
                    <span>
                      {mapObsValueToFormLabel(member.concept.uuid, member.value.uuid, formConceptMap, member.display)}
                    </span>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                <span className={styles.questionText}>
                  {mapConceptToFormLabel(obs.concept.uuid, formConceptMap, obs.concept.display)}
                </span>
                <span>{mapObsValueToFormLabel(obs.concept.uuid, obs.value.uuid, formConceptMap, obs.value)}</span>
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
