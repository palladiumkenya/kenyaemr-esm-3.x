export const careSetting = '6f0c9a92-6f24-11e3-af88-005056821db0';

export const basePath = '${openmrsSpaBase}/patient/';
export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';

//Patient Tracing
export const PatientTracingFormName = 'Patient Tracing Form';
export const MissedAppointmentDate_UUID = '164093AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const TracingType_UUID = 'a55f9516-ddb6-47ec-b10d-cb99d1d0bd41';
export const TracingNumber_UUID = '1639AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Contacted_UUID = '160721AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ReasonNotContacted_UUID = '166541AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const TracingOutcome_UUID = '160433AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const PatientTracingEncounterType_UUID = '1495edf8-2df2-11e9-b210-d663bd873d93';
