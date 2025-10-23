import {
  configSchema,
  MOULDING_NONE_CONCEPT,
  MOULDING_SLIGHT_CONCEPT,
  MOULDING_MODERATE_CONCEPT,
  MOULDING_SEVERE_CONCEPT,
  CERVIX_CONCEPT,
  FETAL_HEART_RATE_CONCEPT,
  FETAL_HEART_RATE_HOUR_CONCEPT,
  DESCENT_OF_HEAD_CONCEPT,
  UTERINE_CONTRACTIONS_CONCEPT,
  UTERINE_CONTRACTION_FREQUENCY_CONCEPT,
  UTERINE_CONTRACTION_DURATION_CONCEPT,
  MATERNAL_PULSE_CONCEPT,
  ROUTE_CONCEPT,
  FREQUENCY_CONCEPT,
  SYSTOLIC_BP_CONCEPT,
  DIASTOLIC_BP_CONCEPT,
  TEMPERATURE_CONCEPT,
  PROTEIN_LEVEL_CONCEPT,
  GLUCOSE_LEVEL_CONCEPT,
  KETONE_LEVEL_CONCEPT,
  URINE_VOLUME_CONCEPT,
  CONTRACTION_COUNT_CONCEPT,
  URINE_CHARACTERISTICS_CONCEPT,
  MEDICATION_CONCEPT,
  MEDICATION_NAME_CONCEPT,
  OXYTOCIN_DOSE_CONCEPT,
  IV_FLUIDS_CONCEPT,
  DOSAGE_CONCEPT,
  DRUG_DOSE_CONCEPT,
  EVENT_TYPE_CONCEPT,
  EVENT_DESCRIPTION_CONCEPT,
  AMNIOTIC_FLUID_CONCEPT,
  MOULDING_CONCEPT,
  BLOOD_GROUP_CONCEPT,
  TIME_SLOT_CONCEPT,
  LABOR_PATTERN_CONCEPT,
  HOURS_SINCE_RUPTURE_CONCEPT,
  RUPTURED_MEMBRANES_CONCEPT,
  DATE_OF_ADMISSION_CONCEPT,
  GESTATION_WEEKS_CONCEPT,
  ESTIMATED_DELIVERY_DATE_CONCEPT,
  LAST_MENSTRUAL_PERIOD_CONCEPT,
  AMNIOTIC_CLEAR_LIQUOR_CONCEPT,
  AMNIOTIC_MECONIUM_STAINED_CONCEPT,
  AMNIOTIC_ABSENT_CONCEPT,
  AMNIOTIC_BLOOD_STAINED_CONCEPT,
  STATION_0_CONCEPT,
  STATION_1_CONCEPT,
  STATION_2_CONCEPT,
  STATION_3_CONCEPT,
  STATION_4_CONCEPT,
  STATION_5_CONCEPT,
  PULSE_BP_TIME_CONCEPT,
  FETAL_HEART_RATE_TIME_CONCEPT,
  CONTRACTION_LEVEL_MILD_CONCEPT,
  CONTRACTION_LEVEL_MODERATE_CONCEPT,
  CONTRACTION_LEVEL_STRONG_CONCEPT,
} from '../../../config-schema';

const _CODE_TO_PLUS_MAP: Record<string, string> = {
  [MOULDING_NONE_CONCEPT]: '0',
  '0': '0',
  [MOULDING_SLIGHT_CONCEPT]: '+',
  '+': '+',
  [MOULDING_MODERATE_CONCEPT]: '++',
  '++': '++',
  [MOULDING_SEVERE_CONCEPT]: '+++',
  '+++': '+++',
};

export const codeToPlus = (raw?: string): string => {
  const key = (raw ?? '').toString().trim();
  return _CODE_TO_PLUS_MAP[key] ?? raw ?? '';
};
const _partoConcepts = (configSchema as any)?.partography?._default?.conceptUuids ?? {};

export const PARTOGRAPHY_CONCEPTS = {
  cervix: _partoConcepts.cervix ?? CERVIX_CONCEPT,
  'fetal-heart-rate': _partoConcepts['fetal-heart-rate'] ?? FETAL_HEART_RATE_CONCEPT,
  'fetal-heart-rate-hour': _partoConcepts['fetal-heart-rate-hour'] ?? FETAL_HEART_RATE_HOUR_CONCEPT,
  'fetal-heart-rate-time': _partoConcepts['fetal-heart-rate-time'] ?? FETAL_HEART_RATE_TIME_CONCEPT,

  'cervical-dilation': _partoConcepts['cervical-dilation'] ?? CERVIX_CONCEPT,
  'descent-of-head': _partoConcepts['descent-of-head'] ?? DESCENT_OF_HEAD_CONCEPT,
  'uterine-contractions': _partoConcepts['uterine-contractions'] ?? UTERINE_CONTRACTIONS_CONCEPT,
  'uterine-contraction-frequency':
    _partoConcepts['uterine-contraction-frequency'] ?? UTERINE_CONTRACTION_FREQUENCY_CONCEPT,
  'uterine-contraction-duration':
    _partoConcepts['uterine-contraction-duration'] ?? UTERINE_CONTRACTION_DURATION_CONCEPT,
  'maternal-pulse': _partoConcepts['maternal-pulse'] ?? MATERNAL_PULSE_CONCEPT,
  'systolic-bp': _partoConcepts['systolic-bp'] ?? SYSTOLIC_BP_CONCEPT,
  'diastolic-bp': _partoConcepts['diastolic-bp'] ?? DIASTOLIC_BP_CONCEPT,
  temperature: _partoConcepts.temperature ?? TEMPERATURE_CONCEPT,
  'protein-level': _partoConcepts['protein-level'] ?? PROTEIN_LEVEL_CONCEPT,
  'glucose-level': _partoConcepts['glucose-level'] ?? GLUCOSE_LEVEL_CONCEPT,
  'ketone-level': _partoConcepts['ketone-level'] ?? KETONE_LEVEL_CONCEPT,
  'urine-volume': _partoConcepts['urine-volume'] ?? URINE_VOLUME_CONCEPT,
  'contraction-count': _partoConcepts['contraction-count'] ?? CONTRACTION_COUNT_CONCEPT,
  'urine-characteristics': _partoConcepts['urine-characteristics'] ?? URINE_CHARACTERISTICS_CONCEPT,
  medication: _partoConcepts.medication ?? MEDICATION_CONCEPT,
  'medication-name': _partoConcepts['medication-name'] ?? MEDICATION_NAME_CONCEPT,
  'oxytocin-dose': _partoConcepts['oxytocin-dose'] ?? OXYTOCIN_DOSE_CONCEPT,
  'iv-fluids': _partoConcepts['iv-fluids'] ?? IV_FLUIDS_CONCEPT,
  dosage: _partoConcepts.dosage ?? DOSAGE_CONCEPT,
  route: _partoConcepts.route ?? ROUTE_CONCEPT,
  frequency: _partoConcepts.frequency ?? FREQUENCY_CONCEPT,
  'drug-dose': _partoConcepts['drug-dose'] ?? DRUG_DOSE_CONCEPT,
  'event-type': _partoConcepts['event-type'] ?? EVENT_TYPE_CONCEPT,
  'event-description': _partoConcepts['event-description'] ?? EVENT_DESCRIPTION_CONCEPT,
  'amniotic-fluid': _partoConcepts['amniotic-fluid'] ?? AMNIOTIC_FLUID_CONCEPT,
  moulding: _partoConcepts.moulding ?? MOULDING_CONCEPT,
  'blood-group': _partoConcepts['blood-group'] ?? BLOOD_GROUP_CONCEPT,
  'time-slot': _partoConcepts['time-slot'] ?? TIME_SLOT_CONCEPT,
  'pulse-time-slot': _partoConcepts['pulse-time-slot'] ?? PULSE_BP_TIME_CONCEPT,
  'labor-pattern': _partoConcepts['labor-pattern'] ?? LABOR_PATTERN_CONCEPT,
  'hours-since-rupture': _partoConcepts['hours-since-rupture'] ?? HOURS_SINCE_RUPTURE_CONCEPT,
  'ruptured-membranes': _partoConcepts['ruptured-membranes'] ?? RUPTURED_MEMBRANES_CONCEPT,
  'date-of-admission': _partoConcepts['date-of-admission'] ?? DATE_OF_ADMISSION_CONCEPT,
  'gestation-weeks': _partoConcepts['gestation-weeks'] ?? GESTATION_WEEKS_CONCEPT,
  'estimated-delivery-date': _partoConcepts['estimated-delivery-date'] ?? ESTIMATED_DELIVERY_DATE_CONCEPT,
  'last-menstrual-period': _partoConcepts['last-menstrual-period'] ?? LAST_MENSTRUAL_PERIOD_CONCEPT,
} as const;

const _partoUuids = (configSchema as any)?.partography?._default?.uuids ?? {};

export const MCH_PARTOGRAPHY_ENCOUNTER_UUID =
  _partoUuids.mchPartographyEncounterUuid ?? '022d62af-e2a5-4282-953b-52dd5cba3296';

export const CONTRACTION_STRONG_UUID =
  _partoUuids.contractionStrongConceptUuid ?? '4b90b73a-ad11-4650-91b0-baea131974e0';

export const PARTOGRAPHY_GRAPH_TYPES = [
  'cervix',
  'fetal-heart-rate',
  'cervical-dilation',
  'descent-of-head',
  'uterine-contractions',
  'maternal-pulse',
  'blood-pressure',
  'pulse-bp-combined',
  'temperature',
  'urine-analysis',
  'drugs-fluids',
  'progress-events',
] as const;

export const PARTOGRAPHY_ENCOUNTER_TYPES = Object.fromEntries(
  PARTOGRAPHY_GRAPH_TYPES.map((type) => [
    type,
    type === 'drugs-fluids'
      ? _partoUuids.drugsFluidsEncounterUuid ?? '39da3525-afe4-45ff-8977-c53b7b359158'
      : type === 'pulse-bp-combined'
      ? MCH_PARTOGRAPHY_ENCOUNTER_UUID
      : MCH_PARTOGRAPHY_ENCOUNTER_UUID,
  ]),
) as Record<(typeof PARTOGRAPHY_GRAPH_TYPES)[number], string>;

export interface OpenMRSResponse<T> {
  results: T[];
}

export interface PartographyObservation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
  };
  value: string | number;
  obsDatetime: string;
  encounter: {
    uuid: string;
    encounterType: {
      uuid: string;
      display: string;
    };
  };
}

export interface PartographyEncounter {
  uuid: string;
  encounterDatetime: string;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: PartographyObservation[];
}

export type PartographyGraphType = keyof typeof PARTOGRAPHY_ENCOUNTER_TYPES;

export interface PartographyGraph {
  id: PartographyGraphType;
  titleKey: string;
  titleDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  yAxisLabel: string;
  normalRange: string;
  color: string;
  yMin: number;
  yMax: number;
}

export const PARTOGRAPHY_UNITS = {
  cervix: 'cm',
  'fetal-heart-rate': 'BPM',
  'cervical-dilation': 'cm',
  'descent-of-head': 'Station',
  'uterine-contractions': 'per 10min',
  'maternal-pulse': 'BPM',
  'blood-pressure': 'mmHg',
  temperature: '°C',
  'urine-analysis': 'Level',
  'drugs-fluids': 'ml/hr',
  'progress-events': 'Value',
} as const;

export const PARTOGRAPHY_NORMAL_RANGES = {
  cervix: '1-10 cm',
  'fetal-heart-rate': '110-160 BPM',
  'cervical-dilation': '0-10 cm',
  'descent-of-head': '-3 to +3',
  'uterine-contractions': '2-5 per 10min',
  'maternal-pulse': '60-100 BPM',
  'blood-pressure': '90/60-140/90',
  temperature: '36-37.5°C',
  'urine-analysis': 'Negative/Trace',
  'drugs-fluids': 'As prescribed',
  'progress-events': 'Timeline based',
} as const;

export const PARTOGRAPHY_COLORS = {
  cervix: 'blue',
  'fetal-heart-rate': 'red',
  'cervical-dilation': 'blue',
  'descent-of-head': 'green',
  'uterine-contractions': 'purple',
  'maternal-pulse': 'orange',
  'blood-pressure': 'cyan',
  temperature: 'teal',
  'urine-analysis': 'yellow',
  'drugs-fluids': 'magenta',
  'progress-events': 'gray',
} as const;

export const PARTOGRAPHY_Y_RANGES = {
  cervix: { min: 1, max: 10 },
  'fetal-heart-rate': { min: 80, max: 200 },
  'cervical-dilation': { min: 0, max: 10 },
  'descent-of-head': { min: -4, max: 4 },
  'uterine-contractions': { min: 0, max: 6 },
  'maternal-pulse': { min: 50, max: 120 },
  'blood-pressure': { min: 50, max: 180 },
  temperature: { min: 35, max: 39 },
  'urine-analysis': { min: 0, max: 4 },
  'drugs-fluids': { min: 0, max: 500 },
  'progress-events': { min: 0, max: 10 },
} as const;

export const PARTOGRAPHY_COLOR_MAPPINGS = {
  red: '#da1e28',
  blue: '#0f62fe',
  green: '#24a148',
  purple: '#8a3ffc',
  orange: '#ff832b',
  cyan: '#1192e8',
  teal: '#009d9a',
  yellow: '#f1c21b',
  magenta: '#d12771',
  gray: '#525252',
} as const;

export const isValidPartographyGraphType = (type: string): type is PartographyGraphType => {
  return PARTOGRAPHY_GRAPH_TYPES.includes(type as PartographyGraphType);
};

export const getPartographyUnit = (graphType: PartographyGraphType): string => {
  return PARTOGRAPHY_UNITS[graphType];
};

export const getPartographyNormalRange = (graphType: PartographyGraphType): string => {
  return PARTOGRAPHY_NORMAL_RANGES[graphType];
};

export const getPartographyColor = (graphType: PartographyGraphType): string => {
  return PARTOGRAPHY_COLORS[graphType];
};

export const getPartographyYRange = (graphType: PartographyGraphType): { min: number; max: number } => {
  return PARTOGRAPHY_Y_RANGES[graphType];
};

export const PARTOGRAPHY_GRAPH_CONFIGS: PartographyGraph[] = [
  {
    id: 'cervix',
    titleKey: 'cervix',
    titleDefault: 'Cervix',
    descriptionKey: 'cervixDesc',
    descriptionDefault: 'Cervical monitoring during labor',
    yAxisLabel: 'cm',
    normalRange: '1-10 cm',
    color: 'blue',
    yMin: 1,
    yMax: 10,
  },
  {
    id: 'fetal-heart-rate',
    titleKey: 'fetalHeartRate',
    titleDefault: 'Fetal Heart Rate',
    descriptionKey: 'fetalHeartRateDesc',
    descriptionDefault: 'Monitor fetal well-being during labor',
    yAxisLabel: 'BPM',
    normalRange: '110-160 BPM',
    color: 'red',
    yMin: 80,
    yMax: 200,
  },
  {
    id: 'cervical-dilation',
    titleKey: 'cervicalDilation',
    titleDefault: 'Cervical Dilation',
    descriptionKey: 'cervicalDilationDesc',
    descriptionDefault: 'Progress of cervical opening during labor',
    yAxisLabel: 'cm',
    normalRange: '0-10 cm',
    color: 'blue',
    yMin: 0,
    yMax: 10,
  },
  {
    id: 'descent-of-head',
    titleKey: 'descentOfHead',
    titleDefault: 'Descent of Head',
    descriptionKey: 'descentOfHeadDesc',
    descriptionDefault: 'Fetal head position relative to ischial spines',
    yAxisLabel: 'Station',
    normalRange: '-3 to +3',
    color: 'green',
    yMin: -4,
    yMax: 4,
  },
  {
    id: 'uterine-contractions',
    titleKey: 'uterineContractions',
    titleDefault: 'Uterine Contractions',
    descriptionKey: 'uterineContractionsDesc',
    descriptionDefault: 'Frequency and intensity of contractions',
    yAxisLabel: 'Contractions/10min',
    normalRange: '2-5 per 10min',
    color: 'purple',
    yMin: 0,
    yMax: 6,
  },
  {
    id: 'maternal-pulse',
    titleKey: 'maternalPulse',
    titleDefault: 'Maternal Pulse',
    descriptionKey: 'maternalPulseDesc',
    descriptionDefault: 'Heart rate monitoring during labor',
    yAxisLabel: 'BPM',
    normalRange: '60-100 BPM',
    color: 'orange',
    yMin: 50,
    yMax: 120,
  },
  {
    id: 'blood-pressure',
    titleKey: 'bloodPressure',
    titleDefault: 'Blood Pressure',
    descriptionKey: 'bloodPressureDesc',
    descriptionDefault: 'Systolic and diastolic blood pressure',
    yAxisLabel: 'mmHg',
    normalRange: '90/60-140/90',
    color: 'cyan',
    yMin: 50,
    yMax: 180,
  },
  {
    id: 'temperature',
    titleKey: 'temperature',
    titleDefault: 'Temperature',
    descriptionKey: 'temperatureDesc',
    descriptionDefault: 'Maternal body temperature monitoring',
    yAxisLabel: '°C',
    normalRange: '36-37.5°C',
    color: 'teal',
    yMin: 35,
    yMax: 39,
  },
  {
    id: 'urine-analysis',
    titleKey: 'urineAnalysis',
    titleDefault: 'Urine Analysis',
    descriptionKey: 'urineAnalysisDesc',
    descriptionDefault: 'Protein, glucose, and ketones in urine',
    yAxisLabel: 'Level',
    normalRange: 'Negative/Trace',
    color: 'yellow',
    yMin: 0,
    yMax: 4,
  },
  {
    id: 'drugs-fluids',
    titleKey: 'drugsFluids',
    titleDefault: 'Drugs & Fluids',
    descriptionKey: 'drugsFluidsDesc',
    descriptionDefault: 'Medications and fluid administration',
    yAxisLabel: 'ml/hr',
    normalRange: 'As prescribed',
    color: 'magenta',
    yMin: 0,
    yMax: 500,
  },
  {
    id: 'progress-events',
    titleKey: 'progressEvents',
    titleDefault: 'Progress & Events',
    descriptionKey: 'progressEventsDesc',
    descriptionDefault: 'Labor milestones and significant events',
    yAxisLabel: 'Progress Stage',
    normalRange: 'Timeline based',
    color: 'gray',
    yMin: 0,
    yMax: 10,
  },
];

export const getTranslatedPartographyGraphs = (t: (key: string, fallback: string) => string) => {
  const cervixOnlyConfigs = PARTOGRAPHY_GRAPH_CONFIGS.filter((config) => config.id === 'cervix');

  return cervixOnlyConfigs.map((config) => ({
    id: config.id,
    title: t(config.titleKey, config.titleDefault),
    description: t(config.descriptionKey, config.descriptionDefault),
    yAxisLabel: config.yAxisLabel,
    normalRange: config.normalRange,
    color: config.color,
    yMin: config.yMin,
    yMax: config.yMax,
  }));
};

export const getPartographyTableHeaders = (t: (key: string, fallback: string) => string) => [
  { key: 'dateTime', header: t('dateAndTime', 'Date and time') },
  { key: 'value', header: t('value', 'Value') },
  { key: 'unit', header: t('unit', 'Unit') },
];

export const getColorForGraph = (colorName: string): string => {
  return PARTOGRAPHY_COLOR_MAPPINGS[colorName as keyof typeof PARTOGRAPHY_COLOR_MAPPINGS] || '#525252';
};

export const FORM_OPTION_CONCEPTS = {
  AMNIOTIC_FLUID: {
    MEMBRANE_INTACT: PARTOGRAPHY_CONCEPTS['amniotic-fluid'],
    CLEAR_LIQUOR:
      (configSchema as any)?.partography?._default?.conceptUuids?.['amniotic-clear-liquor'] ??
      AMNIOTIC_CLEAR_LIQUOR_CONCEPT,
    MECONIUM_STAINED:
      (configSchema as any)?.partography?._default?.conceptUuids?.['amniotic-meconium-stained'] ??
      AMNIOTIC_MECONIUM_STAINED_CONCEPT,
    ABSENT: (configSchema as any)?.partography?._default?.conceptUuids?.['amniotic-absent'] ?? AMNIOTIC_ABSENT_CONCEPT,
    BLOOD_STAINED:
      (configSchema as any)?.partography?._default?.conceptUuids?.['amniotic-blood-stained'] ??
      AMNIOTIC_BLOOD_STAINED_CONCEPT,
  },

  MOULDING: {
    NONE: (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-none'] ?? MOULDING_NONE_CONCEPT,
    SLIGHT: (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-slight'] ?? MOULDING_SLIGHT_CONCEPT,
    MODERATE:
      (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-moderate'] ?? MOULDING_MODERATE_CONCEPT,
    SEVERE: (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-severe'] ?? MOULDING_SEVERE_CONCEPT,
  },

  DESCENT_STATION: {
    ZERO_FIFTHS: (configSchema as any)?.partography?._default?.conceptUuids?.['station-0'] ?? STATION_0_CONCEPT,
    ONE_FIFTH: (configSchema as any)?.partography?._default?.conceptUuids?.['station-1'] ?? STATION_1_CONCEPT,
    TWO_FIFTHS: (configSchema as any)?.partography?._default?.conceptUuids?.['station-2'] ?? STATION_2_CONCEPT,
    THREE_FIFTHS: (configSchema as any)?.partography?._default?.conceptUuids?.['station-3'] ?? STATION_3_CONCEPT,
    FOUR_FIFTHS: (configSchema as any)?.partography?._default?.conceptUuids?.['station-4'] ?? STATION_4_CONCEPT,
    FIVE_FIFTHS: (configSchema as any)?.partography?._default?.conceptUuids?.['station-5'] ?? STATION_5_CONCEPT,
  },

  CONTRACTION_INTENSITY: {
    MILD: CONTRACTION_LEVEL_MILD_CONCEPT,
    MODERATE: CONTRACTION_LEVEL_MODERATE_CONCEPT,
    STRONG: CONTRACTION_LEVEL_STRONG_CONCEPT,
  },

  URINE_LEVELS: {
    NEGATIVE: (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-none'] ?? MOULDING_NONE_CONCEPT,
    TRACE: (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-slight'] ?? MOULDING_SLIGHT_CONCEPT,
    POSITIVE_PLUS:
      (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-moderate'] ?? MOULDING_MODERATE_CONCEPT,
    POSITIVE_PLUS_PLUS:
      (configSchema as any)?.partography?._default?.conceptUuids?.['moulding-severe'] ?? MOULDING_SEVERE_CONCEPT,
  },

  BLOOD_GROUP: PARTOGRAPHY_CONCEPTS['blood-group'],

  EVENT_TYPES: {
    MEMBRANE_RUPTURE: PARTOGRAPHY_CONCEPTS['event-type'],
    LABOR_ONSET: PARTOGRAPHY_CONCEPTS['event-type'],
    POSITION_CHANGE: PARTOGRAPHY_CONCEPTS['event-type'],
    MEDICATION_GIVEN: PARTOGRAPHY_CONCEPTS['event-type'],
    COMPLICATION: PARTOGRAPHY_CONCEPTS['event-type'],
    DELIVERY: PARTOGRAPHY_CONCEPTS['event-type'],
    OTHER: PARTOGRAPHY_CONCEPTS['event-type'],
  },
} as const;

export const AMNIOTIC_FLUID_OPTIONS = [
  { value: '', text: 'chooseAnOption', conceptUuid: '' },
  {
    value: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.MEMBRANE_INTACT,
    text: 'membraneIntact',
    conceptUuid: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.MEMBRANE_INTACT,
  },
  {
    value: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.CLEAR_LIQUOR,
    text: 'clearLiquor',
    conceptUuid: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.CLEAR_LIQUOR,
  },
  {
    value: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.MECONIUM_STAINED,
    text: 'meconiumStained',
    conceptUuid: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.MECONIUM_STAINED,
  },
  {
    value: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.ABSENT,
    text: 'absent',
    conceptUuid: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.ABSENT,
  },
  {
    value: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.BLOOD_STAINED,
    text: 'bloodStained',
    conceptUuid: FORM_OPTION_CONCEPTS.AMNIOTIC_FLUID.BLOOD_STAINED,
  },
] as const;

export const MOULDING_OPTIONS = [
  { value: '', text: 'chooseAnOption', display: '', conceptUuid: '' },
  {
    value: FORM_OPTION_CONCEPTS.MOULDING.NONE,
    text: 'none',
    display: '0',
    conceptUuid: FORM_OPTION_CONCEPTS.MOULDING.NONE,
  },
  {
    value: FORM_OPTION_CONCEPTS.MOULDING.SLIGHT,
    text: 'slight',
    display: '+',
    conceptUuid: FORM_OPTION_CONCEPTS.MOULDING.SLIGHT,
  },
  {
    value: FORM_OPTION_CONCEPTS.MOULDING.MODERATE,
    text: 'moderate',
    display: '++',
    conceptUuid: FORM_OPTION_CONCEPTS.MOULDING.MODERATE,
  },
  {
    value: FORM_OPTION_CONCEPTS.MOULDING.SEVERE,
    text: 'severe',
    display: '+++',
    conceptUuid: FORM_OPTION_CONCEPTS.MOULDING.SEVERE,
  },
] as const;

export const ROUTE_OPTIONS = [
  { id: 'oral', text: 'Oral' },
  { id: 'iv', text: 'Intravenous (IV)' },
  { id: 'im', text: 'Intramuscular (IM)' },
  { id: 'sc', text: 'Subcutaneous (SC)' },
  { id: 'topical', text: 'Topical' },
  { id: 'inhalation', text: 'Inhalation' },
  { id: 'other', text: 'Other' },
] as const;

export const FREQUENCY_OPTIONS = [
  { id: 'stat', text: 'STAT (immediately)' },
  { id: 'od', text: 'Once daily (OD)' },
  { id: 'bd', text: 'Twice daily (BD)' },
  { id: 'tds', text: 'Three times daily (TDS)' },
  { id: 'qds', text: 'Four times daily (QDS)' },
  { id: 'q4h', text: 'Every 4 hours' },
  { id: 'q6h', text: 'Every 6 hours' },
  { id: 'q8h', text: 'Every 8 hours' },
  { id: 'q12h', text: 'Every 12 hours' },
  { id: 'prn', text: 'As needed (PRN)' },
  { id: 'other', text: 'Other' },
] as const;

export const DESCENT_OF_HEAD_OPTIONS = [
  { value: '', text: 'selectStation', stationValue: 0, conceptUuid: '' },
  {
    value: FORM_OPTION_CONCEPTS.DESCENT_STATION.ZERO_FIFTHS,
    text: '0/5',
    stationValue: 0,
    conceptUuid: FORM_OPTION_CONCEPTS.DESCENT_STATION.ZERO_FIFTHS,
  },
  {
    value: FORM_OPTION_CONCEPTS.DESCENT_STATION.ONE_FIFTH,
    text: '1/5',
    stationValue: 1,
    conceptUuid: FORM_OPTION_CONCEPTS.DESCENT_STATION.ONE_FIFTH,
  },
  {
    value: FORM_OPTION_CONCEPTS.DESCENT_STATION.TWO_FIFTHS,
    text: '2/5',
    stationValue: 2,
    conceptUuid: FORM_OPTION_CONCEPTS.DESCENT_STATION.TWO_FIFTHS,
  },
  {
    value: FORM_OPTION_CONCEPTS.DESCENT_STATION.THREE_FIFTHS,
    text: '3/5',
    stationValue: 3,
    conceptUuid: FORM_OPTION_CONCEPTS.DESCENT_STATION.THREE_FIFTHS,
  },
  {
    value: FORM_OPTION_CONCEPTS.DESCENT_STATION.FOUR_FIFTHS,
    text: '4/5',
    stationValue: 4,
    conceptUuid: FORM_OPTION_CONCEPTS.DESCENT_STATION.FOUR_FIFTHS,
  },
  {
    value: FORM_OPTION_CONCEPTS.DESCENT_STATION.FIVE_FIFTHS,
    text: '5/5',
    stationValue: 5,
    conceptUuid: FORM_OPTION_CONCEPTS.DESCENT_STATION.FIVE_FIFTHS,
  },
] as const;

export const CONTRACTION_INTENSITY_OPTIONS = [
  { value: '', text: 'selectIntensity', conceptUuid: '' },
  { value: 'mild', text: 'mild', conceptUuid: FORM_OPTION_CONCEPTS.CONTRACTION_INTENSITY.MILD },
  { value: 'moderate', text: 'moderate', conceptUuid: FORM_OPTION_CONCEPTS.CONTRACTION_INTENSITY.MODERATE },
  { value: 'strong', text: 'strong', conceptUuid: FORM_OPTION_CONCEPTS.CONTRACTION_INTENSITY.STRONG },
] as const;

export const URINE_LEVEL_OPTIONS = [
  { value: '', text: 'selectLevel', conceptUuid: '' },
  {
    value: FORM_OPTION_CONCEPTS.URINE_LEVELS.NEGATIVE,
    text: 'negative',
    conceptUuid: FORM_OPTION_CONCEPTS.URINE_LEVELS.NEGATIVE,
  },
  {
    value: FORM_OPTION_CONCEPTS.URINE_LEVELS.TRACE,
    text: 'trace',
    conceptUuid: FORM_OPTION_CONCEPTS.URINE_LEVELS.TRACE,
  },
  {
    value: FORM_OPTION_CONCEPTS.URINE_LEVELS.POSITIVE_PLUS,
    text: 'positivePlus',
    conceptUuid: FORM_OPTION_CONCEPTS.URINE_LEVELS.POSITIVE_PLUS,
  },
  {
    value: FORM_OPTION_CONCEPTS.URINE_LEVELS.POSITIVE_PLUS_PLUS,
    text: 'positivePlusPlus',
    conceptUuid: FORM_OPTION_CONCEPTS.URINE_LEVELS.POSITIVE_PLUS_PLUS,
  },
] as const;

export const BLOOD_GROUP_OPTIONS = [
  { value: '', text: 'selectBG', conceptUuid: '' },
  { value: 'A+', text: 'A+', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'A-', text: 'A-', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'B+', text: 'B+', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'B-', text: 'B-', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'AB+', text: 'AB+', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'AB-', text: 'AB-', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'O+', text: 'O+', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
  { value: 'O-', text: 'O-', conceptUuid: FORM_OPTION_CONCEPTS.BLOOD_GROUP },
] as const;

export const ADMISSION_OPTIONS = [
  { value: '', text: 'selectAdmission', conceptUuid: '' },
  { value: 'normal', text: 'normal', conceptUuid: PARTOGRAPHY_CONCEPTS['date-of-admission'] },
  { value: 'emergency', text: 'emergency', conceptUuid: PARTOGRAPHY_CONCEPTS['date-of-admission'] },
  { value: 'elective', text: 'elective', conceptUuid: PARTOGRAPHY_CONCEPTS['date-of-admission'] },
  { value: 'referral', text: 'referral', conceptUuid: PARTOGRAPHY_CONCEPTS['date-of-admission'] },
] as const;

export const TIME_SLOT_OPTIONS = [
  { value: '', text: 'selectAM', conceptUuid: '' },
  { value: 'morning', text: 'morning', conceptUuid: PARTOGRAPHY_CONCEPTS['time-slot'] },
  { value: 'afternoon', text: 'afternoon', conceptUuid: PARTOGRAPHY_CONCEPTS['time-slot'] },
  { value: 'evening', text: 'evening', conceptUuid: PARTOGRAPHY_CONCEPTS['time-slot'] },
  { value: 'night', text: 'night', conceptUuid: PARTOGRAPHY_CONCEPTS['time-slot'] },
] as const;

export const MEMBRANE_TIME_SLOT_OPTIONS = [
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' },
  { value: '21:00', label: '21:00' },
  { value: '22:00', label: '22:00' },
  { value: '23:00', label: '23:00' },
  { value: '00:00', label: '00:00' },
  { value: '01:00', label: '01:00' },
  { value: '02:00', label: '02:00' },
  { value: '03:00', label: '03:00' },
  { value: '04:00', label: '04:00' },
  { value: '05:00', label: '05:00' },
] as const;

export const EVENT_TYPE_OPTIONS = [
  { value: '', text: 'selectEventType', conceptUuid: '' },
  {
    value: 'membrane-rupture',
    text: 'membraneRupture',
    conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.MEMBRANE_RUPTURE,
  },
  { value: 'labor-onset', text: 'laborOnset', conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.LABOR_ONSET },
  { value: 'position-change', text: 'positionChange', conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.POSITION_CHANGE },
  {
    value: 'medication-given',
    text: 'medicationGiven',
    conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.MEDICATION_GIVEN,
  },
  { value: 'complication', text: 'complication', conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.COMPLICATION },
  { value: 'delivery', text: 'delivery', conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.DELIVERY },
  { value: 'other', text: 'other', conceptUuid: FORM_OPTION_CONCEPTS.EVENT_TYPES.OTHER },
] as const;

export const getDescentStationMapping = () => {
  const mapping: Record<string, number> = {};
  DESCENT_OF_HEAD_OPTIONS.forEach((option) => {
    if (option.value && option.stationValue !== undefined) {
      mapping[option.value] = option.stationValue;
    }
  });
  return mapping;
};

export const VALIDATION_RANGES = {
  CERVIX: { min: 1, max: 10, normal: { min: 1, max: 10 }, step: 0.5 },
  FETAL_HEART_RATE: { min: 80, max: 200, normal: { min: 110, max: 160 }, step: 1 },
  CERVICAL_DILATION: { min: 0, max: 10, normal: { min: 0, max: 10 }, step: 0.5 },
  MATERNAL_PULSE: { min: 40, max: 140, normal: { min: 60, max: 100 }, step: 1 },
  SYSTOLIC_BP: { min: 60, max: 250, normal: { min: 90, max: 140 }, step: 1 },
  DIASTOLIC_BP: { min: 30, max: 150, normal: { min: 60, max: 90 }, step: 1 },
  TEMPERATURE: { min: 35, max: 42, normal: { min: 36, max: 37.5 }, step: 0.1 },
  UTERINE_CONTRACTIONS: { min: 0, max: 10, normal: { min: 2, max: 5 }, step: 1 },
} as const;

export const INPUT_RANGES = {
  cervix: {
    ...VALIDATION_RANGES.CERVIX,
    placeholderKey: 'cervixPlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['cervix'],
  },
  'fetal-heart-rate': {
    ...VALIDATION_RANGES.FETAL_HEART_RATE,
    placeholderKey: 'fetalHeartRatePlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['fetal-heart-rate'],
  },
  'cervical-dilation': {
    ...VALIDATION_RANGES.CERVICAL_DILATION,
    placeholderKey: 'cervicalDilationPlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['cervical-dilation'],
  },
  'maternal-pulse': {
    ...VALIDATION_RANGES.MATERNAL_PULSE,
    placeholderKey: 'maternalPulsePlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['maternal-pulse'],
  },
  'systolic-bp': {
    ...VALIDATION_RANGES.SYSTOLIC_BP,
    placeholderKey: 'systolicBPPlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['systolic-bp'],
  },
  'diastolic-bp': {
    ...VALIDATION_RANGES.DIASTOLIC_BP,
    placeholderKey: 'diastolicBPPlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['diastolic-bp'],
  },
  temperature: {
    ...VALIDATION_RANGES.TEMPERATURE,
    placeholderKey: 'temperaturePlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS.temperature,
  },
  'uterine-contractions': {
    ...VALIDATION_RANGES.UTERINE_CONTRACTIONS,
    placeholderKey: 'contractionFrequencyPlaceholder',
    conceptUuid: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
  },
} as const;

export const createRangeValidator = (rangeName: keyof typeof VALIDATION_RANGES) => {
  const range = VALIDATION_RANGES[rangeName];
  return (value: string | number): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= range.min && num <= range.max;
  };
};

export const isValidCervicalDilation = createRangeValidator('CERVICAL_DILATION');

export const isValidFetalHeartRate = createRangeValidator('FETAL_HEART_RATE');

export const isValidMaternalPulse = createRangeValidator('MATERNAL_PULSE');

export const isValidSystolicBP = createRangeValidator('SYSTOLIC_BP');

export const isValidDiastolicBP = createRangeValidator('DIASTOLIC_BP');

export const isValidTemperature = createRangeValidator('TEMPERATURE');

export const isValidUterineContractions = createRangeValidator('UTERINE_CONTRACTIONS');

export const isValidBloodPressure = (systolic: string, diastolic: string): boolean => {
  return (
    systolic.trim() !== '' && diastolic.trim() !== '' && isValidSystolicBP(systolic) && isValidDiastolicBP(diastolic)
  );
};

export const isValidUrineAnalysis = (protein: string, glucose: string, ketone: string): boolean => {
  return protein !== '' || glucose !== '' || ketone !== '';
};

export const isValidDrugsFluids = (medication: string, dosage: string): boolean => {
  return medication.trim() !== '' && dosage.trim() !== '';
};

export const isValidProgressEvents = (eventType: string, eventDescription: string): boolean => {
  return eventType !== '' && eventDescription.trim() !== '';
};

export const isValidDescentOfHead = (value: string): boolean => {
  return value.trim() !== '' && DESCENT_OF_HEAD_OPTIONS.some((option) => option.value === value);
};

export const isValidMeasurement = (graphType: string, value: string): boolean => {
  switch (graphType) {
    case 'fetal-heart-rate':
      return isValidFetalHeartRate(value);
    case 'cervical-dilation':
      return isValidCervicalDilation(value);
    case 'maternal-pulse':
      return isValidMaternalPulse(value);
    case 'temperature':
      return isValidTemperature(value);
    case 'uterine-contractions':
      return isValidUterineContractions(value);
    case 'descent-of-head':
      return isValidDescentOfHead(value);
    default:
      return value.trim() !== '';
  }
};
export const MEASUREMENT_LABELS = {
  cervix: { key: 'cervicalDilation', default: 'Cervical Dilation' },
  'fetal-heart-rate': { key: 'fetalHeartRate', default: 'Foetal Heart Rate' },
  'cervical-dilation': { key: 'membraneAmnioticFluidMoulding', default: 'Membrane Amniotic Fluid & Moulding' },
  'descent-of-head': { key: 'descentOfHead', default: 'Descent of Head' },
  'uterine-contractions': { key: 'uterineContractions', default: 'Uterine Contractions' },
  'maternal-pulse': { key: 'maternalPulse', default: 'Maternal Pulse' },
  'blood-pressure': { key: 'bloodPressure', default: 'Blood Pressure' },
  temperature: { key: 'temperature', default: 'Temperature' },
  'urine-analysis': { key: 'urineAnalysis', default: 'Urine Analysis' },
  'drugs-fluids': { key: 'drugsFluids', default: 'Drugs & Fluids' },
  'progress-events': { key: 'progressEvents', default: 'Progress & Events' },
} as const;

export const FIELD_LABELS = {
  fetalHeartRate: { key: 'fetalHeartRate', default: 'Fetal Heart Rate (BPM)' },
  cervicalDilation: { key: 'cervicalDilation', default: 'Cervical Dilation (cm)' },
  maternalPulse: { key: 'maternalPulse', default: 'Maternal Pulse (BPM)' },
  systolic: { key: 'systolic', default: 'Systolic (mmHg)' },
  diastolic: { key: 'diastolic', default: 'Diastolic (mmHg)' },
  temperature: { key: 'temperature', default: 'Temperature (°C)' },
  frequency: { key: 'frequency', default: 'Frequency (per 10min)' },
  amnioticFluid: { key: 'amnioticFluid', default: 'Amniotic Fluid' },
  moulding: { key: 'moulding', default: 'Moulding' },
  descentOfHead: { key: 'descentOfHead', default: 'Descent of Head (Station)' },
  intensity: { key: 'intensity', default: 'Intensity' },
  proteinLevel: { key: 'proteinLevel', default: 'Protein Level' },
  glucoseLevel: { key: 'glucoseLevel', default: 'Glucose Level' },
  ketoneLevel: { key: 'ketoneLevel', default: 'Ketone Level' },
  eventType: { key: 'eventType', default: 'Event Type' },
  medication: { key: 'medication', default: 'Medication/Fluid' },
  dosageRate: { key: 'dosageRate', default: 'Dosage/Rate' },
  eventDescription: { key: 'eventDescription', default: 'Event Description' },
  admission: { key: 'admission', default: 'Admission' },
  bg: { key: 'bg', default: 'BG' },
  am: { key: 'am', default: 'AM' },
} as const;
export const FIELD_PLACEHOLDERS = {
  fetalHeartRatePlaceholder: { key: 'enterFetalHeartRate', default: 'Enter fetal heart rate (110-160 BPM)' },
  cervicalDilationPlaceholder: { key: 'enterCervicalDilation', default: 'Enter cervical dilation (0-10 cm)' },
  maternalPulsePlaceholder: { key: 'enterMaternalPulse', default: 'Enter maternal pulse (60-100 BPM)' },
  systolicBPPlaceholder: { key: 'enterSystolicBP', default: 'Enter systolic BP (90-140 mmHg)' },
  diastolicBPPlaceholder: { key: 'enterDiastolicBP', default: 'Enter diastolic BP (60-90 mmHg)' },
  temperaturePlaceholder: { key: 'enterTemperature', default: 'Enter temperature (36-37.5°C)' },
  contractionFrequencyPlaceholder: { key: 'enterContractionFrequency', default: 'Enter contractions per 10 minutes' },
  contractionIntensityPlaceholder: { key: 'selectContractionIntensity', default: 'Select contraction intensity' },
  descentOfHeadPlaceholder: { key: 'selectDescentStation', default: 'Select descent station (0/5 - 5/5)' },
  amnioticFluidPlaceholder: { key: 'selectAmnioticFluid', default: 'Select amniotic fluid status' },
  mouldingPlaceholder: { key: 'selectMoulding', default: 'Select moulding status' },
  proteinLevelPlaceholder: { key: 'selectProteinLevel', default: 'Select protein level' },
  glucoseLevelPlaceholder: { key: 'selectGlucoseLevel', default: 'Select glucose level' },
  ketoneLevelPlaceholder: { key: 'selectKetoneLevel', default: 'Select ketone level' },
  eventTypePlaceholder: { key: 'selectEventType', default: 'Select event type' },
  medicationType: { key: 'enterMedicationOrFluidType', default: 'Enter medication or fluid type' },
  dosageRate: { key: 'enterDosageOrFlowRate', default: 'Enter dosage or flow rate' },
  eventDescription: { key: 'describeEventOrMilestone', default: 'Describe the event or milestone' },
  generalMeasurement: { key: 'enterMeasurementValue', default: 'Enter measurement value' },
} as const;
export const getMeasurementLabel = (
  graphType: string,
  t: (key: string, fallback: string) => string,
  fallbackTitle?: string,
): string => {
  const labelConfig = MEASUREMENT_LABELS[graphType as keyof typeof MEASUREMENT_LABELS];
  if (labelConfig) {
    return t(labelConfig.key, labelConfig.default);
  }
  return fallbackTitle || graphType;
};
export const getFieldLabel = (
  fieldKey: keyof typeof FIELD_LABELS,
  t: (key: string, fallback: string) => string,
): string => {
  const labelConfig = FIELD_LABELS[fieldKey];
  return t(labelConfig.key, labelConfig.default);
};

export const getFieldPlaceholder = (
  fieldKey: keyof typeof FIELD_PLACEHOLDERS,
  t: (key: string, fallback: string) => string,
): string => {
  const placeholderConfig = FIELD_PLACEHOLDERS[fieldKey];
  return t(placeholderConfig.key, placeholderConfig.default);
};

export const getInputRangePlaceholder = (
  graphType: keyof typeof INPUT_RANGES,
  t: (key: string, fallback: string) => string,
): string => {
  const inputConfig = INPUT_RANGES[graphType];
  if (inputConfig && 'placeholderKey' in inputConfig) {
    return getFieldPlaceholder(inputConfig.placeholderKey as keyof typeof FIELD_PLACEHOLDERS, t);
  }
  return t('enterMeasurementValue', 'Enter measurement value');
};

export const getConceptUuid = (optionType: string, optionValue: string): string => {
  switch (optionType) {
    case 'amnioticFluid':
      return AMNIOTIC_FLUID_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'moulding':
      return MOULDING_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'descentOfHead':
      return DESCENT_OF_HEAD_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'contractionIntensity':
      return CONTRACTION_INTENSITY_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'urineLevel':
      return URINE_LEVEL_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'bloodGroup':
      return BLOOD_GROUP_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'admission':
      return ADMISSION_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'timeSlot':
      return TIME_SLOT_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    case 'eventType':
      return EVENT_TYPE_OPTIONS.find((opt) => opt.value === optionValue)?.conceptUuid || '';
    default:
      return '';
  }
};

export const isWithinNormalRange = (graphType: string, value: number): boolean => {
  const range = Object.values(VALIDATION_RANGES).find((r) => {
    switch (graphType) {
      case 'fetal-heart-rate':
        return r === VALIDATION_RANGES.FETAL_HEART_RATE;
      case 'cervical-dilation':
        return r === VALIDATION_RANGES.CERVICAL_DILATION;
      case 'maternal-pulse':
        return r === VALIDATION_RANGES.MATERNAL_PULSE;
      case 'temperature':
        return r === VALIDATION_RANGES.TEMPERATURE;
      case 'uterine-contractions':
        return r === VALIDATION_RANGES.UTERINE_CONTRACTIONS;
      default:
        return false;
    }
  });

  if (!range || !range.normal) {
    return true;
  }
  return value >= range.normal.min && value <= range.normal.max;
};

export interface GraphDataProcessor {
  validate: (formData: any) => boolean;
  getValue: (formData: any) => number;
  getAdditionalData: (formData: any) => Record<string, any>;
}

export const GRAPH_DATA_PROCESSORS: Record<string, GraphDataProcessor> = {
  'cervical-dilation': {
    validate: (formData) => isValidCervicalDilation(formData.measurementValue),
    getValue: (formData) => parseFloat(formData.measurementValue) || 0,
    getAdditionalData: (formData) => ({
      amnioticFluid: formData.amnioticFluid,
      moulding: formData.moulding,
      conceptUuid: PARTOGRAPHY_CONCEPTS['cervical-dilation'],
    }),
  },
  'blood-pressure': {
    validate: (formData) => isValidBloodPressure(formData.systolic, formData.diastolic),
    getValue: (formData) => parseFloat(formData.systolic) || 0,
    getAdditionalData: (formData) => ({
      diastolic: parseFloat(formData.diastolic) || 0,
      conceptUuid: PARTOGRAPHY_CONCEPTS['systolic-bp'],
      diastolicConceptUuid: PARTOGRAPHY_CONCEPTS['diastolic-bp'],
    }),
  },
  'urine-analysis': {
    validate: (formData) => isValidUrineAnalysis(formData.proteinLevel, formData.glucoseLevel, formData.ketoneLevel),
    getValue: () => 1,
    getAdditionalData: (formData) => ({
      proteinLevel: formData.proteinLevel,
      glucoseLevel: formData.glucoseLevel,
      ketoneLevel: formData.ketoneLevel,
      proteinConceptUuid: PARTOGRAPHY_CONCEPTS['protein-level'],
      glucoseConceptUuid: PARTOGRAPHY_CONCEPTS['glucose-level'],
      ketoneConceptUuid: PARTOGRAPHY_CONCEPTS['ketone-level'],
    }),
  },
  'drugs-fluids': {
    validate: (formData) => isValidDrugsFluids(formData.medication, formData.dosage),
    getValue: () => 1,
    getAdditionalData: (formData) => ({
      medication: formData.medication,
      dosage: formData.dosage,
      medicationConceptUuid: PARTOGRAPHY_CONCEPTS.medication,
      dosageConceptUuid: PARTOGRAPHY_CONCEPTS.dosage,
    }),
  },
  'progress-events': {
    validate: (formData) => isValidProgressEvents(formData.eventType, formData.eventDescription),
    getValue: () => 1,
    getAdditionalData: (formData) => ({
      eventType: formData.eventType,
      eventDescription: formData.eventDescription,
      eventTypeConceptUuid: PARTOGRAPHY_CONCEPTS['event-type'],
      eventDescriptionConceptUuid: PARTOGRAPHY_CONCEPTS['event-description'],
    }),
  },
  'uterine-contractions': {
    validate: (formData) => isValidMeasurement('uterine-contractions', formData.measurementValue),
    getValue: (formData) => parseFloat(formData.measurementValue) || 0,
    getAdditionalData: (formData) => ({
      intensity: formData.eventDescription,
      conceptUuid: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
      intensityConceptUuid: PARTOGRAPHY_CONCEPTS['uterine-contraction-duration'],
    }),
  },
  'descent-of-head': {
    validate: (formData) => isValidDescentOfHead(formData.measurementValue),
    getValue: (formData) => {
      const stationMapping = getDescentStationMapping();
      return stationMapping[formData.measurementValue] ?? 0;
    },
    getAdditionalData: (formData) => {
      const stationMapping = getDescentStationMapping();
      return {
        conceptUuid: formData.measurementValue,
        stationValue: stationMapping[formData.measurementValue] ?? 0,
        descentConceptUuid: PARTOGRAPHY_CONCEPTS['descent-of-head'],
      };
    },
  },
  'fetal-heart-rate': {
    validate: (formData) => isValidMeasurement('fetal-heart-rate', formData.measurementValue),
    getValue: (formData) => parseFloat(formData.measurementValue) || 0,
    getAdditionalData: () => ({
      conceptUuid: PARTOGRAPHY_CONCEPTS['fetal-heart-rate'],
    }),
  },
  'maternal-pulse': {
    validate: (formData) => isValidMeasurement('maternal-pulse', formData.measurementValue),
    getValue: (formData) => parseFloat(formData.measurementValue) || 0,
    getAdditionalData: () => ({
      conceptUuid: PARTOGRAPHY_CONCEPTS['maternal-pulse'],
    }),
  },
  temperature: {
    validate: (formData) => isValidMeasurement('temperature', formData.measurementValue),
    getValue: (formData) => parseFloat(formData.measurementValue) || 0,
    getAdditionalData: () => ({
      conceptUuid: PARTOGRAPHY_CONCEPTS.temperature,
    }),
  },
};

export const getDefaultProcessor = (graphType: string): GraphDataProcessor => ({
  validate: (formData) => isValidMeasurement(graphType, formData.measurementValue),
  getValue: (formData) => parseFloat(formData.measurementValue) || 0,
  getAdditionalData: () => ({
    conceptUuid: PARTOGRAPHY_CONCEPTS[graphType as keyof typeof PARTOGRAPHY_CONCEPTS] || '',
  }),
});

export const getGraphDataProcessor = (graphType: string): GraphDataProcessor => {
  return GRAPH_DATA_PROCESSORS[graphType] || getDefaultProcessor(graphType);
};

export const CERVIX_CHART_OPTIONS = {
  title: 'Cervical Dilation',
  axes: {
    bottom: {
      title: 'Time (Hours)',
      scaleType: 'time',
    },
    left: {
      title: 'Dilation (cm)',
      mapsTo: 'value',
      domain: [0, 10],
      ticks: {
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      scaleType: 'linear',
    },
  },
  data: {
    groups: {
      'Alert Line': { stroke: 'orange', dashed: true, line: { strokeDasharray: '4 4' } },
      'Action Line': { stroke: 'red', dashed: true, line: { strokeDasharray: '4 4' } },
    },
  },
  curve: 'curveLinear',
};

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg' as const;

export const generateRange = (start: number, end: number, step = 1): number[] => {
  const result: number[] = [];
  const precision = Math.max(0, (step.toString().split('.')[1] || '').length);
  for (let v = start; v <= end + Number.EPSILON; v = +(v + step).toFixed(precision)) {
    result.push(Number(v.toFixed(precision)));
  }
  return result;
};

export const AMNIOTIC_FLUID_INITIALS_MAP: Record<string, string> = {
  'Membrane intact': 'M',
  'Clear liquor': 'C',
  Clear: 'C',
  'Meconium Stained': 'MS',
  'Meconium staining': 'MS',
  Absent: 'A',
  'Blood Stained': 'B',
  'Blood stained': 'B',
  A: 'A',
  C: 'C',
  MS: 'MS',
  B: 'B',
};

export const AMNIOTIC_FLUID_LABEL_MAP: Record<string, string> = {
  M: 'Membrane intact',
  C: 'Clear liquor',
  MS: 'Meconium Stained',
  A: 'Absent',
  B: 'Blood Stained',
};

export const MOULDING_SYMBOL_MAP: Record<string, string> = {
  '0': '0',
  '+': '+',
  '++': '++',
  '+++': '+++',
  None: '0',
  'ONE PLUS': '+',
  'TWO PLUS': '++',
  'THREE PLUS': '+++',
};

export const OXYTOCIN_FORM_CONCEPTS = {
  time: FETAL_HEART_RATE_HOUR_CONCEPT,
  oxytocinDropsPerMinute: OXYTOCIN_DOSE_CONCEPT,
} as const;
export const CERVIX_FORM_CONCEPTS = {
  hour: FETAL_HEART_RATE_HOUR_CONCEPT,
  time: FETAL_HEART_RATE_TIME_CONCEPT,
  cervicalDilation: CERVIX_CONCEPT,
  descentOfHead: DESCENT_OF_HEAD_CONCEPT,
} as const;
