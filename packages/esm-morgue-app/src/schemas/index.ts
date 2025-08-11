import { z } from 'zod';
import { ConfigObject } from '../config-schema';

const getConceptCodes = (config: ConfigObject) => ({
  hospitalDeathCodes: [
    config.locationOfDeathTypesList.find((item) => item.label === 'InPatient')?.concept,
    config.locationOfDeathTypesList.find((item) => item.label === 'Outpatient')?.concept,
    config.locationOfDeathTypesList.find((item) => item.label === 'Dead on arrival')?.concept,
  ].filter(Boolean) as string[],
  homeDeathCode: config.locationOfDeathTypesList.find((item) => item.label === 'Home')?.concept,
  policeCaseCode: config.locationOfDeathTypesList.find((item) => item.label === 'Unknown (Police case)')?.concept,
  yesConfirmationCode: config.deathConfirmationTypes.find((type) => type.label === 'Yes')?.concept,
  noConfirmationCode: config.deathConfirmationTypes.find((type) => type.label === 'No')?.concept,
  bodyEmbalmmentCode: config.deadBodyPreservationTypeUuid.find((type) => type.label === 'Body embalment')?.concept,
});

export const createDeceasedPatientAdmitSchema = (config?: ConfigObject) => {
  const baseSchema = z.object({
    dateOfAdmission: z
      .date({ coerce: true })
      .refine((date) => !!date, 'Date of admission is required')
      .refine((date) => date <= new Date(), 'Date of admission cannot be in the future'),
    placeOfDeath: z.string().min(1, 'Place of death is required'),
    tagNumber: z.string().min(1, 'Tag number is required'),
    visitType: z.string().uuid('Invalid visit type'),
    availableCompartment: z
      .union([z.number(), z.string()])
      .refine((val) => {
        if (typeof val === 'string') {
          return val.length > 0 && !isNaN(Number(val)) && Number(val) > 0;
        }
        return typeof val === 'number' && !isNaN(val) && val > 0;
      }, 'Please select a valid compartment')
      .transform((val) => (typeof val === 'string' ? Number(val) : val)),
    paymentMethod: z.string().uuid('Invalid payment method'),
    services: z.array(z.string().uuid('Invalid service')).min(1, 'Must select at least one service'),

    deathConfirmed: z.string().min(1, 'Death confirmation is required'),
    autopsyPermission: z.string().min(1, 'Autopsy permission is required'),

    dateOfDeath: z.date({ coerce: true }).optional(),
    timeOfDeath: z.string().optional(),
    period: z.string().optional(),
    deathNotificationNumber: z.string().optional(),
    attendingClinician: z.string().optional(),
    doctorsRemarks: z.string().optional(),
    causeOfDeath: z.string().optional(),
    deadBodyPreservation: z.string().optional(),
    bodyEmbalmentType: z.string().optional(),
    obNumber: z.string().optional(),
    policeName: z.string().optional(),
    policeIDNo: z.string().optional(),
    insuranceScheme: z.string().optional(),
    policyNumber: z.string().optional(),
  });

  if (!config) {
    return baseSchema;
  }

  return baseSchema.superRefine((data, ctx) => {
    const conceptCodes = getConceptCodes(config);

    const isHospitalDeath = conceptCodes.hospitalDeathCodes.includes(data.placeOfDeath);
    const isHomeDeath = data.placeOfDeath === conceptCodes.homeDeathCode;
    const isPoliceCaseDeath = data.placeOfDeath === conceptCodes.policeCaseCode;

    if (data.visitType !== config.morgueVisitTypeUuid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid visit type for mortuary',
        path: ['visitType'],
      });
    }

    const validConfirmationCodes = [conceptCodes.yesConfirmationCode, conceptCodes.noConfirmationCode].filter(Boolean);
    if (validConfirmationCodes.length > 0 && !validConfirmationCodes.includes(data.deathConfirmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid death confirmation value',
        path: ['deathConfirmed'],
      });
    }

    if (validConfirmationCodes.length > 0 && !validConfirmationCodes.includes(data.autopsyPermission)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid autopsy permission value',
        path: ['autopsyPermission'],
      });
    }

    if (!isHomeDeath && data.placeOfDeath !== '') {
      if (!data.dateOfDeath) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date of death is required for non-home deaths',
          path: ['dateOfDeath'],
        });
      }
      if (!data.timeOfDeath || data.timeOfDeath.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Time of death is required for non-home deaths',
          path: ['timeOfDeath'],
        });
      }
      if (!data.period || data.period.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'AM/PM is required for non-home deaths',
          path: ['period'],
        });
      }
    }

    if (isHospitalDeath) {
      if (!data.attendingClinician || data.attendingClinician.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Attending clinician is required for hospital deaths',
          path: ['attendingClinician'],
        });
      }
      if (!data.doctorsRemarks || data.doctorsRemarks.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Doctor's remarks are required for hospital deaths",
          path: ['doctorsRemarks'],
        });
      }
    }

    if (isPoliceCaseDeath) {
      if (!data.policeName || data.policeName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Police name is required for police cases',
          path: ['policeName'],
        });
      }
      if (!data.policeIDNo || data.policeIDNo.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Police ID number is required for police cases',
          path: ['policeIDNo'],
        });
      }
      if (!data.obNumber || data.obNumber.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'OB number is required for police cases',
          path: ['obNumber'],
        });
      }
    }

    if (data.deadBodyPreservation) {
      const validPreservationTypes = config.deadBodyPreservationTypeUuid.map((type) => type.concept);
      if (!validPreservationTypes.includes(data.deadBodyPreservation)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid body preservation type',
          path: ['deadBodyPreservation'],
        });
      }

      if (data.deadBodyPreservation === conceptCodes.bodyEmbalmmentCode) {
        if (!data.bodyEmbalmentType || data.bodyEmbalmentType.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Body embalment type is required when body embalment is selected',
            path: ['bodyEmbalmentType'],
          });
        } else {
          const validEmbalmmentTypes = config.bodyEmbalmmentTypesUuid.map((type) => type.concept);
          if (!validEmbalmmentTypes.includes(data.bodyEmbalmentType)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid body embalment type',
              path: ['bodyEmbalmentType'],
            });
          }
        }
      }
    }

    if (data.paymentMethod === config.insurancepaymentModeUuid) {
      if (!data.insuranceScheme || data.insuranceScheme.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Insurance scheme is required when insurance payment method is selected',
          path: ['insuranceScheme'],
        });
      }
      if (!data.policyNumber || data.policyNumber.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Policy number is required when insurance is selected',
          path: ['policyNumber'],
        });
      }
    }
  });
};

export const deceasedPatientAdmitSchema = createDeceasedPatientAdmitSchema();

const baseDischargeSchema = z.object({
  burialPermitNumber: z.string().min(1, 'Burial Permit Number is required'),
  nextOfKinNames: z.string().min(1, 'Next of kin names is required'),
  relationshipType: z.string().min(1, 'Next of kin relationship is required'),
  nextOfKinNationalId: z.string().min(1, 'Next of kin national ID is required'),
  nextOfKinContact: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .min(1, 'Next of kin phone number is required'),
});

const dischargeSchema = baseDischargeSchema.extend({
  dischargeType: z.literal('discharge'),
  dateOfDischarge: z.date({ coerce: true }).refine((date) => !!date, 'Date of discharge is required'),
  timeOfDischarge: z.string().min(1, 'Time of discharge is required'),
  period: z
    .string()
    .min(1, 'AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  dischargeArea: z.string().min(1, 'Discharge Area is required'),
});

const transferSchema = baseDischargeSchema.extend({
  dischargeType: z.literal('transfer'),
  dateOfDischarge: z.date({ coerce: true }).refine((date) => !!date, 'Date of discharge is required'),
  timeOfDischarge: z.string().min(1, 'Time of discharge is required'),
  period: z
    .string()
    .min(1, 'AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  dischargeArea: z.string().min(1, 'Discharge Area is required'),
  receivingArea: z.string().min(1, 'Receiving mortuary is required'),
  reasonForTransfer: z.string().min(1, 'Reason for transfer is required'),
});

const disposeSchema = baseDischargeSchema.extend({
  dischargeType: z.literal('dispose'),
  dischargeArea: z.string().min(1, 'Discharge Area is required'),
  serialNumber: z.string().min(1, 'Serial Number is required'),
  courtOrderCaseNumber: z.string().min(1, 'Court Order Case Number is required'),
});

export const dischargeFormSchema = z.discriminatedUnion('dischargeType', [
  dischargeSchema,
  transferSchema,
  disposeSchema,
]);

export type DischargeFormValues = z.infer<typeof dischargeFormSchema>;
export type DischargeType = 'discharge' | 'transfer' | 'dispose';
