import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import styles from './panels.scss';
import { Observation } from '../types';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();

  function getAnswerFromDisplay(display: string): string {
    const colonIndex = display.indexOf(':');
    if (colonIndex === -1) {
      return '';
    } else {
      return display.substring(colonIndex + 1).trim();
    }
  }

  if (!observations || observations.length === 0) {
    return (
      <div className={styles.observation}>
        <p>{t('noObservationsFound', 'No observations found')}</p>
      </div>
    );
  }

  const filteredObservations = !!obsConceptUuidsToHide.length
    ? observations.filter((obs) => !obsConceptUuidsToHide.includes(obs.concept.uuid))
    : observations;

  return (
    <div className={styles.observation}>
      {filteredObservations.map((obs, index) => (
        <React.Fragment key={index}>
          {obs.groupMembers ? (
            <>
              <span className={styles.parentConcept}>{obs.concept.display}</span>
              {obs.groupMembers.map((member, memberIndex) => (
                <div key={memberIndex}>
                  <span className={styles.childConcept}>{member.concept.display}</span>
                  <span>{getAnswerFromDisplay(member.display)}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <span>{obs.concept.display}</span>
              <span>{getAnswerFromDisplay(obs.display)}</span>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default EncounterObservations;
