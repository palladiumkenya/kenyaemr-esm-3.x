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
  if (!regimenData) {
    return [];
  }

  const filterCriterion = patientAge > 14 ? 'Adult' : 'Child';
  return regimenData.filter((group) => group.regimenline.startsWith(filterCriterion));
}

export function calculateAge(birthDateString: string | null | undefined): number {
  if (!birthDateString) {
    return 0;
  }

  const today = new Date();
  const birthDate = new Date(birthDateString);

  if (isNaN(birthDate.getTime())) {
    return 0;
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
