import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  procedureOrderTypeUuid: {
    _type: Type.String,
    _description: 'Procedure Order type UUID',
    _default: '4237a01f-29c5-4167-9d8e-96d6e590aa33',
  },
  procedureConceptSetUuid: {
    _type: Type.String,
    _description: 'Procedure Concept SET UUID',
    _default: '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  testOrderTypeUuid: {
    _type: Type.String,
    _description: 'Test Order type UUID',
    _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
  },
  orders: {
    _type: Type.Object,
    _description: 'List of lab orderable concepts',
    _default: {
      labOrderableConcepts: [],
      labOrderTypeUuid: '',
    },
  },
  conditionConceptClassUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept class UUID for conditions',
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
  },
  procedureComplicationGroupingConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept UUID for grouping procedure complications obs',
    _default: '120202AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  procedureComplicationConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept UUID for capturing procedure complications',
    _default: '120198AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  procedureResultEncounterType: {
    _type: Type.String,
    _description: 'The procedure results encounter type UUID',
    _default: '99a7a6ba-59f4-484e-880d-01cbeaead62f',
  },
  procedureResultEncounterRole: {
    _type: Type.String,
    _description: 'The encounter provider role UUID',
    _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
  },
};

export interface OrderReason {
  labTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}

export interface ConfigObject {
  procedureOrderTypeUuid: string;
  procedureConceptSetUuid: string;
  testOrderTypeUuid: string;
  labTestsWithOrderReasons: Array<OrderReason>;
  showPrintButton: boolean;
  orders: {
    labOrderTypeUuid: string;
    labOrderableConcepts: Array<string>;
  };
  conditionConceptClassUuid: string;
  procedureComplicationGroupingConceptUuid: string;
  procedureComplicationConceptUuid: string;
  procedureResultEncounterType: string;
  procedureResultEncounterRole: string;
}

export const StringPath =
  'M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z';
