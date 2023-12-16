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

export const conceptMap = [
  [
    populationTypeConcept,
    {
      display: 'Population type',
      answers: [
        ['5d308c8c-ad49-45e1-9885-e5d09a8e5587', 'General population'],
        ['bf850dd4-309b-4cbd-9470-9d8110ea5550', 'Key population'],
        ['138643AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Priority population'],
      ],
    },
  ],
  [
    departmentConcept,
    {
      display: 'Department',
      answers: [
        ['160542AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'OPD: Outpatient'],
        ['5485AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'IPD: Inpatient'],
        ['160473AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Emergency'],
        ['160538AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'PMTCT'],
        ['159940AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'VCT'],
        ['163488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Community outreach'],
      ],
    },
  ],
  [
    relationWithIndexClientConcept,
    {
      display: 'Relationship with index client',
      answers: [
        ['163565AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Sexual contact'],
        ['166606AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Social contact'],
        ['166517AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Needle sharing'],
        ['1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'None'],
      ],
    },
  ],
  [
    eligibilityConcept,
    {
      display: 'Client eligible for testing',
      answers: [
        ['1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Yes'],
        ['1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'No'],
      ],
    },
  ],
  [
    testingRecommended,
    {
      display: 'Testing recommended',
      answers: [
        ['1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'Yes'],
        ['1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'No'],
      ],
    },
  ],
];

export const encounterRepresentation =
  'custom:(uuid,encounterDatetime,encounterType,location:(uuid,name),' +
  'patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name)),' +
  'obs:(uuid,obsDatetime,voided,groupMembers,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),' +
  'names:(uuid,conceptNameType,name))),form:(uuid,name))';
