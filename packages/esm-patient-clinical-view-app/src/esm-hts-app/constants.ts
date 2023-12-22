// HTS screening
export const populationTypeConcept = 'cf543666-ce76-4e91-8b8d-c0b54a436a2e';
export const keyPopulationTypeConcept = '160581AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const priorityPopulationConcept = '138643AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const disabilityListConcept = '162558AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const departmentConcept = '159936AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const healthCareWorkerConcept = '5619AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const relationWithIndexClientConcept = '166570AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const eligibilityConcept = '162699AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const mlPrediction = '167163AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const testingRecommended = '167229AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// HTS testing
export const testApproachConcept = '163556AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const testStrategyConcept = 'd85ff219-0f5a-408d-8df0-96bcc9be5071';
export const entryPointConcept = '160540AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const finalResultConcept = '159427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const tbScreeeningConcept = '1659AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';
