// Utility: Map OpenMRS coded values to +/++/+++ for protein/acetone
export const codeToPlus = (code: string) => {
  switch (code) {
    case '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
    case 'ZERO':
    case '0':
      return '0';
    case '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
    case 'ONE PLUS':
    case '+':
      return '+';
    case '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
    case 'TWO PLUS':
    case '++':
      return '++';
    case '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA':
    case 'THREE PLUS':
    case '+++':
      return '+++';
    default:
      return code;
  }
};
export const PARTOGRAPHY_CONCEPTS = {
  cervix: '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'fetal-heart-rate': '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'fetal-heart-rate-hour': '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'fetal-heart-rate-time': '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',

  'cervical-dilation': '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'descent-of-head': '1810AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'uterine-contractions': '163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'uterine-contraction-frequency': '166529AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'uterine-contraction-duration': '159368AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'maternal-pulse': '5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'systolic-bp': '5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'diastolic-bp': '5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  temperature: '5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'protein-level': '161442AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'glucose-level': '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'ketone-level': '165438AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'urine-volume': '159660AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'contraction-count': '159682AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'urine-characteristics': '56AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  medication: '1282AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'medication-name': '164231AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'oxytocin-dose': '166531AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'iv-fluids': '161911AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  dosage: '1443AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'drug-dose': '162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'event-type': '162879AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'event-description': '160632AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'amniotic-fluid': '162653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  moulding: '166527AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'blood-group': '300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  // Use a custom text concept for time slot to ensure string compatibility
  'time-slot': 'a1b2c3d4-1111-2222-3333-444455556666',
  'labor-pattern': '164135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'hours-since-rupture': '167149AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'ruptured-membranes': '164900AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'date-of-admission': '1640AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'gestation-weeks': '1789AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'estimated-delivery-date': '5596AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'last-menstrual-period': '1427AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

export const MCH_PARTOGRAPHY_ENCOUNTER_UUID = '022d62af-e2a5-4282-953b-52dd5cba3296';

// Add 'pulse-bp-combined' as a hidden/utility type for encounter mapping
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

// Map 'pulse-bp-combined' to the same encounter type as 'maternal-pulse' and 'blood-pressure'
export const PARTOGRAPHY_ENCOUNTER_TYPES = Object.fromEntries(
  PARTOGRAPHY_GRAPH_TYPES.map((type) => [
    type,
    type === 'drugs-fluids'
      ? '39da3525-afe4-45ff-8977-c53b7b359158'
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
  // For now, only show the cervix graph
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

// Concept UUID mappings for form options
export const FORM_OPTION_CONCEPTS = {
  // Amniotic fluid concepts
  AMNIOTIC_FLUID: {
    MEMBRANE_INTACT: PARTOGRAPHY_CONCEPTS['amniotic-fluid'], // '162653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    CLEAR_LIQUOR: '159484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    MECONIUM_STAINED: '134488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ABSENT: '163747AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    BLOOD_STAINED: '1077AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },

  // Moulding concepts
  MOULDING: {
    NONE: '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    SLIGHT: '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    MODERATE: '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    SEVERE: '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },

  // Descent of head station concepts
  DESCENT_STATION: {
    ZERO_FIFTHS: '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ONE_FIFTH: '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    TWO_FIFTHS: '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    THREE_FIFTHS: '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    FOUR_FIFTHS: '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    FIVE_FIFTHS: '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },

  // Contraction intensity concepts
  CONTRACTION_INTENSITY: {
    MILD: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
    MODERATE: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
    STRONG: PARTOGRAPHY_CONCEPTS['uterine-contractions'],
  },

  // Urine analysis level concepts
  URINE_LEVELS: {
    NEGATIVE: '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    TRACE: '1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    POSITIVE_PLUS: '1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    POSITIVE_PLUS_PLUS: '1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },

  // Blood group concept (single concept, different values)
  BLOOD_GROUP: PARTOGRAPHY_CONCEPTS['blood-group'],

  // Event type concepts
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

// Form option configurations using concepts
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

// Mapping functions
export const getDescentStationMapping = () => {
  const mapping: Record<string, number> = {};
  DESCENT_OF_HEAD_OPTIONS.forEach((option) => {
    if (option.value && option.stationValue !== undefined) {
      mapping[option.value] = option.stationValue;
    }
  });
  return mapping;
};

// Configurable input validation ranges
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

// Input ranges mapped to graph types
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

// Configurable form validation helpers
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

// Measurement label mappings
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

// Get measurement label function
// Field label mappings for all form inputs
export const FIELD_LABELS = {
  // Number input labels
  fetalHeartRate: { key: 'fetalHeartRate', default: 'Fetal Heart Rate (BPM)' },
  cervicalDilation: { key: 'cervicalDilation', default: 'Cervical Dilation (cm)' },
  maternalPulse: { key: 'maternalPulse', default: 'Maternal Pulse (BPM)' },
  systolic: { key: 'systolic', default: 'Systolic (mmHg)' },
  diastolic: { key: 'diastolic', default: 'Diastolic (mmHg)' },
  temperature: { key: 'temperature', default: 'Temperature (°C)' },
  frequency: { key: 'frequency', default: 'Frequency (per 10min)' },

  // Select field labels
  amnioticFluid: { key: 'amnioticFluid', default: 'Amniotic Fluid' },
  moulding: { key: 'moulding', default: 'Moulding' },
  descentOfHead: { key: 'descentOfHead', default: 'Descent of Head (Station)' },
  intensity: { key: 'intensity', default: 'Intensity' },
  proteinLevel: { key: 'proteinLevel', default: 'Protein Level' },
  glucoseLevel: { key: 'glucoseLevel', default: 'Glucose Level' },
  ketoneLevel: { key: 'ketoneLevel', default: 'Ketone Level' },
  eventType: { key: 'eventType', default: 'Event Type' },

  // Text input labels
  medication: { key: 'medication', default: 'Medication/Fluid' },
  dosageRate: { key: 'dosageRate', default: 'Dosage/Rate' },
  eventDescription: { key: 'eventDescription', default: 'Event Description' },

  // Common labels
  admission: { key: 'admission', default: 'Admission' },
  bg: { key: 'bg', default: 'BG' },
  am: { key: 'am', default: 'AM' },
} as const;

// Placeholder mappings for inputs - all translatable
export const FIELD_PLACEHOLDERS = {
  // Number input placeholders
  fetalHeartRatePlaceholder: { key: 'enterFetalHeartRate', default: 'Enter fetal heart rate (110-160 BPM)' },
  cervicalDilationPlaceholder: { key: 'enterCervicalDilation', default: 'Enter cervical dilation (0-10 cm)' },
  maternalPulsePlaceholder: { key: 'enterMaternalPulse', default: 'Enter maternal pulse (60-100 BPM)' },
  systolicBPPlaceholder: { key: 'enterSystolicBP', default: 'Enter systolic BP (90-140 mmHg)' },
  diastolicBPPlaceholder: { key: 'enterDiastolicBP', default: 'Enter diastolic BP (60-90 mmHg)' },
  temperaturePlaceholder: { key: 'enterTemperature', default: 'Enter temperature (36-37.5°C)' },
  contractionFrequencyPlaceholder: { key: 'enterContractionFrequency', default: 'Enter contractions per 10 minutes' },
  contractionIntensityPlaceholder: { key: 'selectContractionIntensity', default: 'Select contraction intensity' },
  descentOfHeadPlaceholder: { key: 'selectDescentStation', default: 'Select descent station (0/5 - 5/5)' },

  // Select placeholders
  amnioticFluidPlaceholder: { key: 'selectAmnioticFluid', default: 'Select amniotic fluid status' },
  mouldingPlaceholder: { key: 'selectMoulding', default: 'Select moulding status' },
  proteinLevelPlaceholder: { key: 'selectProteinLevel', default: 'Select protein level' },
  glucoseLevelPlaceholder: { key: 'selectGlucoseLevel', default: 'Select glucose level' },
  ketoneLevelPlaceholder: { key: 'selectKetoneLevel', default: 'Select ketone level' },
  eventTypePlaceholder: { key: 'selectEventType', default: 'Select event type' },

  // Text input placeholders
  medicationType: { key: 'enterMedicationOrFluidType', default: 'Enter medication or fluid type' },
  dosageRate: { key: 'enterDosageOrFlowRate', default: 'Enter dosage or flow rate' },
  eventDescription: { key: 'describeEventOrMilestone', default: 'Describe the event or milestone' },
  generalMeasurement: { key: 'enterMeasurementValue', default: 'Enter measurement value' },
} as const;

// Get measurement label function
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

// Get field label function
export const getFieldLabel = (
  fieldKey: keyof typeof FIELD_LABELS,
  t: (key: string, fallback: string) => string,
): string => {
  const labelConfig = FIELD_LABELS[fieldKey];
  return t(labelConfig.key, labelConfig.default);
};

// Get field placeholder function
export const getFieldPlaceholder = (
  fieldKey: keyof typeof FIELD_PLACEHOLDERS,
  t: (key: string, fallback: string) => string,
): string => {
  const placeholderConfig = FIELD_PLACEHOLDERS[fieldKey];
  return t(placeholderConfig.key, placeholderConfig.default);
};

// Get dynamic placeholder for input ranges
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

// Get concept UUID for form option
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

// Validate if measurement is within normal range
export const isWithinNormalRange = (graphType: string, value: number): boolean => {
  const range = Object.values(VALIDATION_RANGES).find((r) => {
    // Match range based on graph type
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

// Configurable data processing for different graph types
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

// Generic processor for unmapped graph types
export const getDefaultProcessor = (graphType: string): GraphDataProcessor => ({
  validate: (formData) => isValidMeasurement(graphType, formData.measurementValue),
  getValue: (formData) => parseFloat(formData.measurementValue) || 0,
  getAdditionalData: () => ({
    conceptUuid: PARTOGRAPHY_CONCEPTS[graphType as keyof typeof PARTOGRAPHY_CONCEPTS] || '',
  }),
});

// Get processor for a specific graph type
export const getGraphDataProcessor = (graphType: string): GraphDataProcessor => {
  return GRAPH_DATA_PROCESSORS[graphType] || getDefaultProcessor(graphType);
};

// Add this configuration object, likely near the PARTOGRAPHY_GRAPH_CONFIGS constant.

export const CERVIX_CHART_OPTIONS = {
  title: 'Cervical Dilation',
  axes: {
    bottom: {
      title: 'Time (Hours)',
      scaleType: 'time',
      // The 30-minute grid is controlled by the chart's 'time' scale,
      // relying on data density and auto-formatting, but we set the time scale.
    },
    left: {
      title: 'Dilation (cm)',
      mapsTo: 'value',
      // Enforce domain 0-10 cm (10 total grids)
      domain: [0, 10],
      // Explicitly set ticks every 1 unit (1 cm grid line)
      ticks: {
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      scaleType: 'linear',
    },
  },
  data: {
    // Define styles for the two new static line groups
    groups: {
      'Alert Line': { stroke: 'orange', dashed: true, line: { strokeDasharray: '4 4' } },
      'Action Line': { stroke: 'red', dashed: true, line: { strokeDasharray: '4 4' } },
    },
  },
  curve: 'curveLinear', // Ensure the lines are straight
};

// You should also ensure this constant is exported in './types/index'
// or directly exported if this is the shared config file.
