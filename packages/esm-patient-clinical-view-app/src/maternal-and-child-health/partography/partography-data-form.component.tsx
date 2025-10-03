import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Modal, TextArea, TextInput, NumberInput, Select, SelectItem, Form, Grid, Column } from '@carbon/react';
import {
  AMNIOTIC_FLUID_OPTIONS,
  MOULDING_OPTIONS,
  DESCENT_OF_HEAD_OPTIONS,
  CONTRACTION_INTENSITY_OPTIONS,
  URINE_LEVEL_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  ADMISSION_OPTIONS,
  TIME_SLOT_OPTIONS,
  EVENT_TYPE_OPTIONS,
  INPUT_RANGES,
  getMeasurementLabel,
  getFieldLabel,
  getFieldPlaceholder,
  getInputRangePlaceholder,
  getGraphDataProcessor,
} from './types';
import styles from './partography-data-form.scss';

type PartographyFormData = {
  admission: string;
  bg: string;
  am: string;
  measurementValue: string;
  systolic: string;
  diastolic: string;
  proteinLevel: string;
  glucoseLevel: string;
  ketoneLevel: string;
  medication: string;
  dosage: string;
  eventType: string;
  eventDescription: string;
  amnioticFluid: string;
  moulding: string;
};

type PartographyDataFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  graphType: string;
  graphTitle: string;
  patient?: fhir.Patient;
};

const PartographyDataForm: React.FC<PartographyDataFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  graphType,
  graphTitle,
  patient,
}) => {
  const { t } = useTranslation();

  const getPatientInfo = (patient?: fhir.Patient) => {
    const getName = (): string => {
      if (!patient?.name?.[0]) {
        return '';
      }
      const name = patient.name[0];
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim();
    };

    const getGender = (): string => (patient?.gender ? t(patient.gender, patient.gender) : '');

    const getAge = (): string => {
      if (!patient?.birthDate) {
        return '';
      }
      const birthDate = new Date(patient.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      return `${adjustedAge} ${t('yearsOld', 'years old')}`;
    };

    return { name: getName(), gender: getGender(), age: getAge() };
  };

  const patientInfo = getPatientInfo(patient);

  const { control, handleSubmit, reset } = useForm<PartographyFormData>({
    defaultValues: {
      admission: '',
      bg: '',
      am: '',
      measurementValue: '',
      systolic: '',
      diastolic: '',
      proteinLevel: '',
      glucoseLevel: '',
      ketoneLevel: '',
      medication: '',
      dosage: '',
      eventType: '',
      eventDescription: '',
      amnioticFluid: '',
      moulding: '',
    },
  });

  const createNumberInput = (
    id: string,
    name: keyof PartographyFormData,
    label: string,
    placeholder: string,
    range: any,
    required = true,
  ) => (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('fieldRequired', 'This field is required') } : {}}
      render={({ field, fieldState }) => (
        <NumberInput
          id={id}
          label={label}
          placeholder={placeholder}
          value={field.value || ''}
          onChange={(e, { value }) => field.onChange(String(value))}
          min={range.min}
          max={range.max}
          step={range.step}
          invalid={!!fieldState.error}
          invalidText={fieldState.error?.message}
          required={required}
        />
      )}
    />
  );

  const createSelect = (
    id: string,
    name: keyof PartographyFormData,
    label: string,
    options: readonly any[],
    required = false,
  ) => (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('fieldRequired', 'This field is required') } : {}}
      render={({ field, fieldState }) => (
        <Select
          id={id}
          labelText={label}
          value={field.value}
          onChange={(e) => field.onChange((e.target as HTMLSelectElement).value)}
          invalid={!!fieldState.error}
          invalidText={fieldState.error?.message}
          required={required}>
          {options.map((option) => (
            <SelectItem
              key={option.value || option.text}
              value={option.value}
              text={t(option.text, (option as any).display || option.text)}
            />
          ))}
        </Select>
      )}
    />
  );

  const createTextInput = (
    id: string,
    name: keyof PartographyFormData,
    label: string,
    placeholder: string,
    required = true,
  ) => (
    <Controller
      name={name}
      control={control}
      rules={required ? { required: t('fieldRequired', 'This field is required') } : {}}
      render={({ field, fieldState }) => (
        <TextInput
          id={id}
          labelText={label}
          placeholder={placeholder}
          value={field.value || ''}
          onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
          invalid={!!fieldState.error}
          invalidText={fieldState.error?.message}
          required={required}
        />
      )}
    />
  );

  const onSubmitForm = (data: PartographyFormData) => {
    const processor = getGraphDataProcessor(graphType);
    if (!processor.validate(data)) {
      return;
    }

    const dataPoint = {
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      value: processor.getValue(data),
      graphType,
      admission: data.admission,
      bg: data.bg,
      am: data.am,
      timestamp: new Date(),
      ...processor.getAdditionalData(data),
    };

    onSubmit(dataPoint);
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderSpecificFields = () => {
    const fieldConfigs = {
      'fetal-heart-rate': () =>
        createNumberInput(
          'fetal-heart-rate-input',
          'measurementValue',
          getFieldLabel('fetalHeartRate', t),
          getInputRangePlaceholder('fetal-heart-rate', t),
          INPUT_RANGES['fetal-heart-rate'],
        ),

      'cervical-dilation': () => (
        <Grid>
          <Column sm={4} md={4} lg={8}>
            {createNumberInput(
              'cervical-dilation-measurement',
              'measurementValue',
              getFieldLabel('cervicalDilation', t),
              getInputRangePlaceholder('cervical-dilation', t),
              INPUT_RANGES['cervical-dilation'],
            )}
          </Column>
          <Column sm={4} md={4} lg={8}>
            {createSelect('amniotic-fluid', 'amnioticFluid', getFieldLabel('amnioticFluid', t), AMNIOTIC_FLUID_OPTIONS)}
          </Column>
          <Column sm={4} md={4} lg={8}>
            {createSelect('moulding', 'moulding', getFieldLabel('moulding', t), MOULDING_OPTIONS)}
          </Column>
        </Grid>
      ),

      'descent-of-head': () =>
        createSelect(
          'descent-select',
          'measurementValue',
          getFieldLabel('descentOfHead', t),
          DESCENT_OF_HEAD_OPTIONS,
          true,
        ),

      'uterine-contractions': () => (
        <Grid>
          <Column sm={4} md={4} lg={8}>
            {createNumberInput(
              'contraction-frequency',
              'measurementValue',
              getFieldLabel('frequency', t),
              getInputRangePlaceholder('uterine-contractions', t),
              INPUT_RANGES['uterine-contractions'],
            )}
          </Column>
          <Column sm={4} md={4} lg={8}>
            {createSelect(
              'contraction-intensity',
              'eventDescription',
              getFieldLabel('intensity', t),
              CONTRACTION_INTENSITY_OPTIONS,
            )}
          </Column>
        </Grid>
      ),

      'maternal-pulse': () =>
        createNumberInput(
          'maternal-pulse-input',
          'measurementValue',
          getFieldLabel('maternalPulse', t),
          getInputRangePlaceholder('maternal-pulse', t),
          INPUT_RANGES['maternal-pulse'],
        ),

      'blood-pressure': () => (
        <Grid>
          <Column sm={4} md={4} lg={8}>
            {createNumberInput(
              'systolic-pressure',
              'systolic',
              getFieldLabel('systolic', t),
              getInputRangePlaceholder('systolic-bp', t),
              INPUT_RANGES['systolic-bp'],
            )}
          </Column>
          <Column sm={4} md={4} lg={8}>
            {createNumberInput(
              'diastolic-pressure',
              'diastolic',
              getFieldLabel('diastolic', t),
              getInputRangePlaceholder('diastolic-bp', t),
              INPUT_RANGES['diastolic-bp'],
            )}
          </Column>
        </Grid>
      ),

      temperature: () =>
        createNumberInput(
          'temperature-input',
          'measurementValue',
          getFieldLabel('temperature', t),
          getInputRangePlaceholder('temperature', t),
          INPUT_RANGES.temperature,
        ),

      'urine-analysis': () => (
        <Grid>
          <Column sm={4} md={2} lg={5}>
            {createSelect('protein-level', 'proteinLevel', getFieldLabel('proteinLevel', t), URINE_LEVEL_OPTIONS)}
          </Column>
          <Column sm={4} md={3} lg={5}>
            {createSelect('glucose-level', 'glucoseLevel', getFieldLabel('glucoseLevel', t), URINE_LEVEL_OPTIONS)}
          </Column>
          <Column sm={4} md={3} lg={6}>
            {createSelect('ketone-level', 'ketoneLevel', getFieldLabel('ketoneLevel', t), URINE_LEVEL_OPTIONS)}
          </Column>
        </Grid>
      ),

      'drugs-fluids': () => (
        <Grid>
          <Column sm={4} md={4} lg={8}>
            {createTextInput(
              'medication-input',
              'medication',
              getFieldLabel('medication', t),
              getFieldPlaceholder('medicationType', t),
            )}
          </Column>
          <Column sm={4} md={4} lg={8}>
            {createTextInput(
              'dosage-input',
              'dosage',
              getFieldLabel('dosageRate', t),
              getFieldPlaceholder('dosageRate', t),
            )}
          </Column>
        </Grid>
      ),

      'progress-events': () => (
        <Grid>
          <Column sm={4} md={8} lg={16}>
            {createSelect('event-type', 'eventType', getFieldLabel('eventType', t), EVENT_TYPE_OPTIONS, true)}
          </Column>
          <Column sm={4} md={8} lg={16}>
            <Controller
              name="eventDescription"
              control={control}
              rules={{ required: t('fieldRequired', 'This field is required') }}
              render={({ field, fieldState }) => (
                <TextArea
                  id="event-description"
                  labelText={getFieldLabel('eventDescription', t)}
                  placeholder={getFieldPlaceholder('eventDescription', t)}
                  value={field.value || ''}
                  onChange={(e) => field.onChange((e.target as HTMLTextAreaElement).value)}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  rows={3}
                  required
                />
              )}
            />
          </Column>
        </Grid>
      ),
    };

    const config = fieldConfigs[graphType as keyof typeof fieldConfigs];
    return config
      ? config()
      : createTextInput(
          'general-measurement',
          'measurementValue',
          getMeasurementLabel(graphType, t, graphTitle),
          getFieldPlaceholder('generalMeasurement', t),
        );
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={onClose}
      modalHeading={`${getMeasurementLabel(graphType, t, graphTitle)} Data`}
      modalLabel={`${patientInfo.name}, ${patientInfo.gender}, ${patientInfo.age}`}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit(onSubmitForm)}
      onSecondarySubmit={handleClose}
      size="lg">
      <div className={styles.modalContent}>
        <Form onSubmit={handleSubmit(onSubmitForm)}>
          <Grid>
            <Column sm={4} md={8} lg={5}>
              {createSelect('admission-select', 'admission', getFieldLabel('admission', t), ADMISSION_OPTIONS)}
            </Column>
            <Column sm={4} md={8} lg={5}>
              {createSelect('bg-select', 'bg', getFieldLabel('bg', t), BLOOD_GROUP_OPTIONS)}
            </Column>
            <Column sm={4} md={8} lg={6}>
              {createSelect('am-select', 'am', getFieldLabel('am', t), TIME_SLOT_OPTIONS)}
            </Column>
          </Grid>
          <div className={styles.measurementSection}>{renderSpecificFields()}</div>
        </Form>
      </div>
    </Modal>
  );
};

export default PartographyDataForm;
