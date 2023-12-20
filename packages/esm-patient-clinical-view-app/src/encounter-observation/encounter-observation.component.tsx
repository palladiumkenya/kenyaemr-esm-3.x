import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import styles from './encounter-observation-table.scss';
import { Observation } from '../types';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();
  const conceptMap = new Map([
    ['1658AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Adherence rating'],
    ['164848AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Patient received viral load result'],
    [
      '163310AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'Was the Viral load result suppressed (less than 1000) or unsuppressed (greater than 1000) ',
    ],
    ['160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Way forward'],
    ['160110AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Have any dosses been missed?'],
    ['1898AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', "Patient's condition improved since last visit"],
    ['95f73a05-7c52-4a8d-b3b1-f632a41d065d', 'Will the patient benefit from a home visit?'],
    ['164891AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Date of first session'],
    ['162846AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Pill count adherence % (from pill count)'],
    ['1272AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Has the patient been referred to other services?'],
  ]);

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

  function matchFormDisplay(conceptUuid: string): string {
    let theDisplay = conceptMap.get(conceptUuid) ? conceptMap.get(conceptUuid) : '';
    return theDisplay;
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
                <span className={styles.parentConcept}>{obs.concept.display}</span>
                <span />
                {obs.groupMembers.map((member) => (
                  <React.Fragment key={index}>
                    <span className={styles.childConcept}>{member.concept.display}</span>
                    <span>{getAnswerFromDisplay(member.display)}</span>
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={index}>
                <span>
                  {matchFormDisplay(obs.concept.uuid) ? matchFormDisplay(obs.concept.uuid) : obs.concept.display}
                </span>
                <span>{getAnswerFromDisplay(obs.display)}</span>
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
