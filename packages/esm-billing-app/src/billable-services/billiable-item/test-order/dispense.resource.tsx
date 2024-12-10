import dayjs from 'dayjs';

type MedicationDispense = {
  resourceType: string;
  status: any;
  authorizingPrescription: Array<{ reference: string; type: string }>;
  medicationReference: any;
  medicationCodeableConcept: any;
  subject: any;
  performer: Array<{ actor: { reference: string } }>;
  location: { reference: string };
  whenHandedOver: string;
  quantity?: {
    value: unknown;
    code: unknown;
    unit: unknown;
    system: unknown;
  };
  dosageInstruction?: Array<unknown>;
  substitution?: unknown;
};

export const createMedicationDispenseProps = (props) => {
  const { patientUuid, encounterUuid, medicationRequestBundle, quantityRemaining, session, providers = [] } = props;

  return {
    patientUuid,
    encounterUuid,
    medicationDispense: initiateMedicationDispenseBody(medicationRequestBundle.request, session, providers, true),
    medicationRequestBundle,
    quantityRemaining,
    mode: 'enter',
  };
};

export function initiateMedicationDispenseBody(medicationRequest, session, providers, populateDispenseInformation) {
  let medicationDispense: MedicationDispense = {
    resourceType: 'MedicationDispense',
    status: null,
    authorizingPrescription: [{ reference: 'MedicationRequest/' + medicationRequest.id, type: 'MedicationRequest' }],
    medicationReference: medicationRequest.medicationReference,
    medicationCodeableConcept: medicationRequest.medicationCodeableConcept,
    subject: medicationRequest.subject,
    performer: [
      {
        actor: {
          reference:
            session?.currentProvider && providers.some((provider) => provider.uuid == session.currentProvider.uuid)
              ? `Practitioner/${session.currentProvider.uuid}`
              : '',
        },
      },
    ],
    location: { reference: session?.sessionLocation ? `Location/${session.sessionLocation.uuid}` : '' },
    whenHandedOver: dayjs().format(),
  };

  if (populateDispenseInformation) {
    medicationDispense = {
      ...medicationDispense,
      quantity: medicationRequest.dispenseRequest?.quantity,
      dosageInstruction: [
        {
          text: [
            medicationRequest.dosageInstruction[0].text,
            medicationRequest.dosageInstruction[0].additionalInstruction?.[0]?.text,
          ]
            .filter(Boolean)
            .join(' '),
          timing: medicationRequest.dosageInstruction[0].timing,
          asNeededBoolean: false,
          route: medicationRequest.dosageInstruction[0].route,
          doseAndRate: medicationRequest.dosageInstruction[0].doseAndRate || [
            { doseQuantity: { value: null, code: null, unit: null } },
          ],
        },
      ],
      substitution: {
        wasSubstituted: false,
        reason: [{ coding: [{ code: null }] }],
        type: { coding: [{ code: null }] },
      },
    };
  }
  return medicationDispense;
}
