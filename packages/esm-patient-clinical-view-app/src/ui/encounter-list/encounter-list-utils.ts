import { formatDate, parseDate } from '@openmrs/esm-framework';
import { ancConceptMap } from '../../maternal-and-child-health/concept-maps/antenatal-care-concepts-map';

export function getEncounterValues(encounter, param: string, isDate?: Boolean) {
  if (isDate) {
    return formatDate(parseDate(encounter[param]));
  } else {
    return encounter[param] ? encounter[param] : '--';
  }
}

export function formatDateTime(dateString: string): any {
  const format = 'YYYY-MM-DDTHH:mm:ss';
  if (dateString.includes('.')) {
    dateString = dateString.split('.')[0];
  }
  return formatDate(parseDate(dateString));
}

export function obsArrayDateComparator(left, right) {
  return formatDateTime(right.obsDatetime) - formatDateTime(left.obsDatetime);
}

export function findObs(encounter, obsConcept): Record<string, any> {
  const allObs = encounter?.obs?.filter((observation) => observation.concept.uuid === obsConcept) || [];
  return allObs?.length == 1 ? allObs[0] : allObs?.sort(obsArrayDateComparator)[0];
}

export function getObsFromEncounters(encounters, obsConcept) {
  const filteredEnc = encounters?.find((enc) => enc.obs.find((obs) => obs.concept.uuid === obsConcept));
  return getObsFromEncounter(filteredEnc, obsConcept);
}

export function getMultipleObsFromEncounter(encounter, obsConcepts: Array<string>) {
  let observations = [];
  obsConcepts.map((concept) => {
    const obs = getObsFromEncounter(encounter, concept);
    if (obs !== '--') {
      observations.push(obs);
    }
  });

  return observations.length ? observations.join(', ') : '--';
}

export function getObsFromEncounter(encounter, obsConcept, isDate?: Boolean, isTrueFalseConcept?: Boolean) {
  const obs = findObs(encounter, obsConcept);

  if (isTrueFalseConcept) {
    if (obs.value.uuid == 'cf82933b-3f3f-45e7-a5ab-5d31aaee3da3') {
      return 'Yes';
    } else {
      return 'No';
    }
  }
  if (!obs) {
    return '--';
  }
  if (isDate) {
    return formatDate(parseDate(obs.value), { mode: 'wide' });
  }
  if (typeof obs.value === 'object' && obs.value?.names) {
    return (
      obs.value?.names?.find((conceptName) => conceptName.conceptNameType === 'SHORT')?.name || obs.value.name.name
    );
  }
  return obs.value;
}

export function mapObsValueToFormLabel(
  conceptUuid: string,
  answerConceptUuid: string,
  formConceptMap: { [key: string]: any },
  defaultValue: string,
): string {
  const typeOfVal = typeof defaultValue;
  if (typeOfVal === 'number') {
    // check early if value is number and return
    return defaultValue;
  }

  const conceptMapOverride = formConceptMap !== undefined && Object.keys(formConceptMap).length > 0;
  if (conceptMapOverride && answerConceptUuid !== undefined) {
    // check for boolean concepts
    if (answerConceptUuid === '1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
      answerConceptUuid = '0';
    } else if (answerConceptUuid === '2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
      answerConceptUuid = '1';
    }
    let theDisplay = formConceptMap[conceptUuid]?.answers[answerConceptUuid];

    if (typeof theDisplay !== undefined) {
      return theDisplay;
    } else {
      return extractDefaultValueBasedOnType(defaultValue);
    }
  } else if (!conceptMapOverride || answerConceptUuid !== undefined) {
    if (typeOfVal === 'object') {
      return defaultValue['name']?.['name']; // extract the default name from the object
    }
  } else {
    return extractDefaultValueBasedOnType(defaultValue);
  }
}

function extractDefaultValueBasedOnType(defaultValue: any): string {
  const typeOfVal = typeof defaultValue;

  if (defaultValue !== undefined) {
    if (typeOfVal === 'string') {
      const stringParts = defaultValue.split(':');
      if (stringParts.length === 0 || stringParts.length === 1) {
        return defaultValue;
      } else if (stringParts.length === 2) {
        return stringParts[1];
      } else {
        // TODO: identify other cases to support here
        // check for date
        return formatDate(parseDate(defaultValue));
      }
    } else if (typeOfVal === 'object') {
      return defaultValue['name']?.['name']; // extract the default name from the object
    }
  } else {
    return defaultValue;
  }
}
export function mapConceptToFormLabel(conceptUuid: string, formConceptMap: object, defaultValue: string): string {
  if (formConceptMap === undefined) {
    return defaultValue;
  }

  let theDisplay = formConceptMap[conceptUuid] ? formConceptMap[conceptUuid].display : defaultValue;

  return theDisplay;
}

/**
 * This is a util method stub for generating the mapping for labels in the form schema
 * It should be moved to an appropriate place if not here
 */
export function generateFormLabelsFromJSON() {
  const htsScreeningJson = { pages: [] };
  const result = {};
  htsScreeningJson.pages.forEach((page) => {
    page.sections.forEach((section) => {
      section.questions.forEach((question) => {
        let answersMap = {};
        let questionObject = {};
        question.questionOptions.answers?.forEach((ans) => {
          answersMap[ans.concept] = ans.label;
        });
        questionObject['display'] = question.label;
        questionObject['answers'] = answersMap;
        result[question.questionOptions.concept] = questionObject;
      });
    });
  });
}
