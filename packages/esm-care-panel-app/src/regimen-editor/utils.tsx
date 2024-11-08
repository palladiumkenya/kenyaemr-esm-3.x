import { RegimenLineGroup } from '../types';

export function addOrUpdateObsObject(objectToAdd, obsArray, setObjectArray) {
  if (doesObjectExistInArray(obsArray, objectToAdd)) {
    setObjectArray((prevObsArray) =>
      prevObsArray.map((obs) => (obs.concept === objectToAdd.concept ? objectToAdd : obs)),
    );
  } else {
    setObjectArray((prevObsArray) => [...prevObsArray, objectToAdd]);
  }
}

const doesObjectExistInArray = (obsArray, objectToCheck) =>
  obsArray.some((obs) => obs.concept === objectToCheck.concept);

export function filterRegimenData(regimenData: RegimenLineGroup[] | undefined, patientAge: number): RegimenLineGroup[] {
  if (!regimenData?.length) {
    return [];
  }

  const filterCriterion = patientAge > 14 ? 'Adult' : 'Child';
  return regimenData.filter(({ regimenline }) => regimenline?.includes(filterCriterion));
}

export function calculateAge(birthDateString: string | null | undefined, visitDate: Date): number {
  if (!birthDateString) {
    return 0;
  }

  const birthDate = new Date(birthDateString);

  if (isNaN(birthDate.getTime())) {
    return 0;
  }

  let age = visitDate.getFullYear() - birthDate.getFullYear();
  const m = visitDate.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && visitDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
