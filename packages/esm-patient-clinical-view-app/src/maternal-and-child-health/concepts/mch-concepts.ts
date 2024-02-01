export const vLResultsConcept = '1305AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export const ancVisitNumberConcept = '1425AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

//Labour & Delivery
export const infantStatusAtBirthConcept = '159917AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const deliveryOutcomeConcept = '159949AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ancHivResultConcept = 'c5f74c86-62cd-4d22-9260-4238f1e45fe0';
export const hivStatusAtDeliveryConcept = 'c5f74c86-62cd-4d22-9260-4238f1e45fe0';
export const artInitiationConcept = '6e62bf7e-2107-4d09-b485-6e60cbbb2d08';
export const birthCountConcept = '1568AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const hivTestStatus = '164401AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const recenctViralLoad = '163310AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const motherStatusConcept = '1856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const hivTestAtMaternityResults = '1396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const placeOfDeliveryConcept = '1572AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export const infantDeliveryGroupingConcept = '1c70c490-cafa-4c95-9fdd-a30b62bb78b8';
export const infantPTrackerIdConcept = '164803AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const infantDateOfBirth = '164802AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

//Infant Postnatal
export const infantPostnatalEncounterType = 'af1f1b24-d2e8-4282-b308-0bf79b365584';
export const nextVisitDate = '5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ChildPTrackerId = '6c45421e-2566-47cb-bbb3-07586fffbfe2';
export const childDateOfBirth = '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const artProphylaxisStatus = '1148AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const linkedToArt = 'a40d8bc4-56b8-4f28-a1dd-412da5cf20ed';
export const breastfeedingStatus = '1151AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const outcomeStatus = '160433AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const infantVisitDate = '159599AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const finalTestResults = '164460AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

//Antenatal
export const antenatalEncounterType = '2549af50-75c8-4aeb-87ca-4bb2cef6c69a';
export const visitDateConcept = '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const hivTestResultConcept = '159427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const partnerHivStatus = '1436AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const artNoConcept = '164402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const followUpDateConcept = '5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const eDDConcept = '5596AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const nextVisitDateConcept = '5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const artStartDate = '159599AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ancVisitsConcept = '1425AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const testTypeConcept = 'ee8c0292-47f8-4c01-8b60-8ba13a560e1a';
export const infantExposureStatus = '6027869c-5d7e-4a82-b22f-6d9c57d61a4d';

//Mother Postnatal
export const motherPostnatalEncounterType = '269bcc7f-04f8-4ddc-883d-7a3a0d569aad';
export const MothervisitDate = '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MotherHivStatus = '159427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MotherViralLoadDate = '163281AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MotherViralLoadResult = '1305AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const MotherNextVisitDate = '5096AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const artUniqueNoConcept = '164402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const motherGeneralConditionConcept = '1856AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const motherBreastConditionConcept = '159780AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const pphConditionConcept = '230AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const uterusConditionConcept = '163742AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

//Reports
export const ancVisitsReport = '5299521a-7fad-47bb-8280-14c99d04c790';
export const eddReport = 'aac635c9-0a77-4489-8b0d-866b3ad22f73';
export const motherHivStatusReport = 'ed50a889-dd5b-4759-861c-b54e3c686fe7';

//MCH Summary
export const mchEncounterType = '12de5bc5-352e-4faf-9961-a2125085a75c';
export const antenatalVisitType = '164181AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const mchVisitType = '140084BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
export const mchVisitsTypes = ['Antenatal', 'Labor and Delivery', 'Mother Postnatal'];

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';
export const partoGraphRepresentation =
  'custom:(patient:(uuid),obs:(obsDatetime,groupMembers:(display,concept:(uuid,display),value),value:(uuid,name:(uuid,name),names:(uuid,conceptNameType,name))))';
