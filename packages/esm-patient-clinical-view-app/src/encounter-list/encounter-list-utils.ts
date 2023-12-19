import { formatDate, parseDate } from '@openmrs/esm-framework';

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

export function mapConceptToFormLabel(
  conceptUuid: string,
  formConceptMap: Map<string, { display: string; answers: [] }>,
  isConceptQuestion: boolean,
): string {
  const ourMap = formConceptMap;
  if (formConceptMap.size < 1) {
    return String('');
  }
  let theDisplay = formConceptMap.get(conceptUuid) ? formConceptMap.get(conceptUuid).display : '';

  return theDisplay;
}

export function mapObsValueToFormLabel(conceptUuid: string, answerConceptUuid: string, formConceptMap: object): string {
  if (formConceptMap === undefined) {
    return String('');
  }

  let theDisplay = formConceptMap[conceptUuid] ? formConceptMap[conceptUuid]?.answers[answerConceptUuid] : '';

  return String(theDisplay);
}

export function mapConceptToFormLabel3(
  conceptUuid: string,
  formConceptMap: object,
  isConceptQuestion: boolean,
): string {
  if (formConceptMap === undefined) {
    return String('');
  }

  let theDisplay = formConceptMap[conceptUuid] ? formConceptMap[conceptUuid].display : '';

  return theDisplay;
}

export function generateFormLabelsFromJSON() {
  // const htsScreeningJson = {};
  // const result = {};
  // htsScreeningJson.pages.forEach((page) => {
  //   //console.log('page: ', page.sections);
  //   page.sections.forEach((section) => {
  //     section.questions.forEach((question) => {
  //       let answersMap = {};
  //       let questionObject = {};
  //       question.questionOptions.answers?.forEach((ans) => {
  //         answersMap[ans.concept] = ans.label;
  //       });
  //       questionObject['display'] = question.label;
  //       questionObject['answers'] = answersMap;
  //       result[question.questionOptions.concept] = questionObject;
  //     });
  //   });
  // });
  // console.log('schema: ', JSON.stringify(result));
}
