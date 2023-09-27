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
