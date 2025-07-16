import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonText } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import styles from './observation.scss';
import { Observation } from '../../../types';

interface EncounterObservationsProps {
  observations: Array<Observation>;
}

const EncounterObservations: React.FC<EncounterObservationsProps> = ({ observations }) => {
  const { t } = useTranslation();
  const { obsConceptUuidsToHide = [] } = useConfig();

  const filterObservations = (obsList: Array<Observation>) =>
    obsConceptUuidsToHide.length ? obsList.filter((obs) => !obsConceptUuidsToHide.includes(obs.concept.uuid)) : obsList;

  const renderAnswer = (value: any) => (typeof value === 'object' ? value?.name?.name || '' : value);

  if (!observations) {
    return <SkeletonText />;
  }

  const filteredObservations = filterObservations(observations);

  return (
    <div className={styles.observation}>
      {filteredObservations.length > 0 ? (
        filteredObservations.map((obs) =>
          obs.groupMembers ? (
            <React.Fragment key={obs.uuid}>
              <span className={styles.parentConcept}>{obs.concept?.name?.name}</span>
              {obs.groupMembers.map((member) => (
                <React.Fragment key={member.uuid}>
                  <span className={styles.childConcept}>{member.concept?.display}</span>
                  <span>{renderAnswer(member.value)}</span>
                </React.Fragment>
              ))}
            </React.Fragment>
          ) : (
            <React.Fragment key={obs.uuid}>
              <span>{obs.concept?.name?.name}</span>
              <span>{renderAnswer(obs.value)}</span>
            </React.Fragment>
          ),
        )
      ) : (
        <div className={styles.observation}>
          <p>{t('noObservationsFound', 'No observations found')}</p>
        </div>
      )}
    </div>
  );
};

export default EncounterObservations;
