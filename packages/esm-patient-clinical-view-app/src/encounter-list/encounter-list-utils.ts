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

export function mapConceptToFormLabel2(conceptUuid: string, formConceptMap: Array<any>): string {
  //conceptUuid: string, formConceptMap: Array<Array<[string,{display: string, answers: [string]}]>>
  if (formConceptMap.length < 1) {
    return String('');
  }
  return '';

  // const conceptMap = new Map(formConceptMap);
  // let theDisplay = conceptMap.get(conceptUuid) ? conceptMap.get(conceptUuid).get('display') : '';
  // return String(theDisplay);
}

export function mapConceptToFormLabel(
  conceptUuid: string,
  formConceptMap: Map<string, { display: string; answers: [] }>,
): string {
  //conceptUuid: string, formConceptMap: Array<Array<[string,{display: string, answers: [string]}]>>
  if (formConceptMap.size < 1) {
    return String('');
  }

  let theDisplay = formConceptMap.get(conceptUuid) ? formConceptMap.get(conceptUuid).display : '';
  let answers = formConceptMap.get(conceptUuid)
    ? formConceptMap.get(conceptUuid).answers['1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA']
    : '';
  console.log('All answers: ', formConceptMap.get(conceptUuid)?.answers || []);
  console.log('answer: ', answers);

  return theDisplay;
}
