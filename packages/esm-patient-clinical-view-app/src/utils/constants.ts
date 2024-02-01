export const careSetting = '6f0c9a92-6f24-11e3-af88-005056821db0';

export const basePath = '${openmrsSpaBase}/patient/';
export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';

export const clinicalEncounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),diagnoses:(uuid,diagnosis:(coded:(display))),' +
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

export const ClinicalEncounterFormUuid = 'e958f902-64df-4819-afd4-7fb061f59308';

export const AdmissionDate_UUID = '1640AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

// export const PrimaryDiagnosis_UUID = '';
export const PriorityOfAdmission_UUID = '1655AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
// export const AdmittingDoctor_UUID= '';
export const AdmissionWard_UUID = '5fc29316-0869-4b3b-ae2f-cc37c6014eb7';
export const MchEncounterType_UUID = 'c6d09e05-1f25-4164-8860-9f32c5a02df0';
export const Alcohol_Use_UUID = '159449AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Alcohol_Use_Duration_UUID = '1546AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Smoking_UUID = '163201AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Smoking_Duration_UUID = '159931AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Other_Substance_Abuse_UUID = '163731AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Surgical_History_UUID = '30fe6669-75f3-4a1d-89c3-753a060d559a';
export const Accident_Trauma_UUID = '159520AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Blood_Transfusion_UUID = '161927AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const Chronic_Disease_UUID = '1284AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

//delivery
export const ModeOfDelivery_UUID = '5630AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const GestationalSize_UUID = '1789AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const BirthAbnormally_UUID = '164122AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const BloodLoss_UUID = '161928AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const GivenVitaminK_UUID = '984AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const DeliveryForm_UUID = '496c7cc3-0eea-4e84-a04c-2292949e2f7f';
