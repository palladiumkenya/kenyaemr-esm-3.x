import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  TextArea,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Button,
  Form,
  FormGroup,
  Grid,
  Column,
  Tag,
} from '@carbon/react';
import styles from './partography-data-form.scss';

type PartographyDataFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  graphType: string;
  graphTitle: string;
  patientName?: string;
  patientGender?: string;
  patientAge?: string;
};

const PartographyDataForm: React.FC<PartographyDataFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  graphType,
  graphTitle,
  patientName = 'Rose Aryango',
  patientGender = 'Female',
  patientAge = '40 Years',
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = false;
    let value = 0;
    let additionalData = {};

    switch (graphType) {
      case 'cervical-dilation':
        isValid =
          formData.measurementValue !== '' &&
          parseFloat(formData.measurementValue) >= 0 &&
          parseFloat(formData.measurementValue) <= 10;
        value = parseFloat(formData.measurementValue) || 0;
        additionalData = {
          amnioticFluid: formData.amnioticFluid,
          moulding: formData.moulding,
        };
        break;

      case 'blood-pressure':
        isValid = formData.systolic.trim() !== '' && formData.diastolic.trim() !== '';
        value = parseFloat(formData.systolic) || 0;
        additionalData = { diastolic: parseFloat(formData.diastolic) || 0 };
        break;

      case 'urine-analysis':
        isValid = formData.proteinLevel !== '' || formData.glucoseLevel !== '' || formData.ketoneLevel !== '';
        value = 1;
        additionalData = {
          proteinLevel: formData.proteinLevel,
          glucoseLevel: formData.glucoseLevel,
          ketoneLevel: formData.ketoneLevel,
        };
        break;

      case 'drugs-fluids':
        isValid = formData.medication.trim() !== '' && formData.dosage.trim() !== '';
        value = 1;
        additionalData = {
          medication: formData.medication,
          dosage: formData.dosage,
        };
        break;

      case 'progress-events':
        isValid = formData.eventType !== '' && formData.eventDescription.trim() !== '';
        value = 1;
        additionalData = {
          eventType: formData.eventType,
          eventDescription: formData.eventDescription,
        };
        break;

      case 'uterine-contractions':
        isValid = formData.measurementValue.trim() !== '';
        value = parseFloat(formData.measurementValue) || 0;
        additionalData = { intensity: formData.eventDescription };
        break;

      case 'descent-of-head':
        isValid = formData.measurementValue.trim() !== '';
        const stationMapping = {
          '160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 0, // 0/5
          '162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 1, // 1/5
          '166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 2, // 2/5
          '166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 3, // 3/5
          '166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 4, // 4/5
          '163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA': 5, // 5/5
        };
        value = stationMapping[formData.measurementValue] ?? 0;
        additionalData = {
          conceptUuid: formData.measurementValue,
          stationValue: value,
        };
        break;

      default:
        isValid = formData.measurementValue.trim() !== '';
        value = parseFloat(formData.measurementValue) || 0;
        break;
    }

    if (!isValid) {
      return;
    }

    // Create data point with current time
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const dataPoint = {
      time: currentTime,
      value,
      graphType,
      admission: formData.admission,
      bg: formData.bg,
      am: formData.am,
      timestamp: new Date(),
      ...additionalData,
    };

    onSubmit(dataPoint);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getMeasurementLabel = () => {
    switch (graphType) {
      case 'fetal-heart-rate':
        return t('fetalHeartRate', 'Foetal Heart Rate');
      case 'cervical-dilation':
        return t('membraneAmnioticFluidMoulding', 'Membrane Amniotic Fluid & Moulding');
      case 'descent-of-head':
        return t('descentOfHead', 'Descent of Head');
      case 'uterine-contractions':
        return t('uterineContractions', 'Uterine Contractions');
      case 'maternal-pulse':
        return t('maternalPulse', 'Maternal Pulse');
      case 'blood-pressure':
        return t('bloodPressure', 'Blood Pressure');
      case 'temperature':
        return t('temperature', 'Temperature');
      case 'urine-analysis':
        return t('urineAnalysis', 'Urine Analysis');
      case 'drugs-fluids':
        return t('drugsFluids', 'Drugs & Fluids');
      case 'progress-events':
        return t('progressEvents', 'Progress & Events');
      default:
        return graphTitle;
    }
  };

  const renderSpecificFields = () => {
    switch (graphType) {
      case 'fetal-heart-rate':
        return (
          <NumberInput
            id="fetal-heart-rate-input"
            label={t('fetalHeartRate', 'Fetal Heart Rate (BPM)')}
            placeholder="Enter fetal heart rate (110-160)"
            value={formData.measurementValue}
            onChange={(e, { value }) => setFormData({ ...formData, measurementValue: String(value) })}
            min={80}
            max={200}
            step={1}
            required
          />
        );

      case 'cervical-dilation':
        return (
          <Grid>
            <Column sm={4} md={4} lg={8}>
              <NumberInput
                id="cervical-dilation-measurement"
                label={t('cervicalDilation', 'Cervical Dilation (cm)')}
                placeholder="Enter cervical dilation (0-10)"
                value={formData.measurementValue}
                onChange={(e, { value }) => setFormData({ ...formData, measurementValue: String(value) })}
                min={0}
                max={10}
                step={0.5}
                required
              />
            </Column>
            <Column sm={4} md={4} lg={8}>
              <Select
                id="amniotic-fluid"
                labelText={t('amnioticFluid', 'Amniotic Fluid')}
                value={formData.amnioticFluid}
                onChange={(e) => setFormData({ ...formData, amnioticFluid: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('chooseAnOption', 'Choose an option')} />
                <SelectItem
                  value="164899AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                  text={t('membraneIntact', 'Membrane intact')}
                />
                <SelectItem value="159484AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('clearLiquor', 'Clear liquor')} />
                <SelectItem
                  value="134488AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                  text={t('meconiumStained', 'Meconium Stained')}
                />
                <SelectItem value="163747AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('absent', 'Absent')} />
                <SelectItem value="1077AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('bloodStained', 'Blood Stained')} />
              </Select>
            </Column>
            <Column sm={4} md={4} lg={8}>
              <Select
                id="moulding"
                labelText={t('moulding', 'Moulding')}
                value={formData.moulding}
                onChange={(e) => setFormData({ ...formData, moulding: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('chooseAnOption', 'Choose an option')} />
                <SelectItem value="1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('none', '0')} />
                <SelectItem value="1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('slight', '+')} />
                <SelectItem value="1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('moderate', '++')} />
                <SelectItem value="1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text={t('severe', '+++')} />
              </Select>
            </Column>
          </Grid>
        );

      case 'descent-of-head':
        return (
          <Select
            id="descent-select"
            labelText={t('descentOfHead', 'Descent of Head (Station)')}
            value={formData.measurementValue}
            onChange={(e) => setFormData({ ...formData, measurementValue: (e.target as HTMLSelectElement).value })}
            required>
            <SelectItem value="" text={t('selectStation', 'Select station')} />
            <SelectItem value="160769AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="0/5" />
            <SelectItem value="162135AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="1/5" />
            <SelectItem value="166065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="2/5" />
            <SelectItem value="166066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="3/5" />
            <SelectItem value="166067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="4/5" />
            <SelectItem value="163734AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="5/5" />
          </Select>
        );

      case 'uterine-contractions':
        return (
          <Grid>
            <Column sm={4} md={4} lg={8}>
              <NumberInput
                id="contraction-frequency"
                label={t('frequency', 'Frequency (per 10min)')}
                placeholder="Contractions per 10 minutes"
                value={formData.measurementValue}
                onChange={(e, { value }) => setFormData({ ...formData, measurementValue: String(value) })}
                min={0}
                max={10}
                step={1}
                required
              />
            </Column>
            <Column sm={4} md={4} lg={8}>
              <Select
                id="contraction-intensity"
                labelText={t('intensity', 'Intensity')}
                value={formData.eventDescription}
                onChange={(e) => setFormData({ ...formData, eventDescription: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectIntensity', 'Select intensity')} />
                <SelectItem value="mild" text={t('mild', 'Mild')} />
                <SelectItem value="moderate" text={t('moderate', 'Moderate')} />
                <SelectItem value="strong" text={t('strong', 'Strong')} />
              </Select>
            </Column>
          </Grid>
        );

      case 'maternal-pulse':
        return (
          <NumberInput
            id="maternal-pulse-input"
            label={t('maternalPulse', 'Maternal Pulse (BPM)')}
            placeholder="Enter maternal pulse (60-100)"
            value={formData.measurementValue}
            onChange={(e, { value }) => setFormData({ ...formData, measurementValue: String(value) })}
            min={40}
            max={140}
            step={1}
            required
          />
        );

      case 'blood-pressure':
        return (
          <Grid>
            <Column sm={4} md={4} lg={8}>
              <NumberInput
                id="systolic-pressure"
                label={t('systolic', 'Systolic (mmHg)')}
                placeholder="Systolic pressure"
                value={formData.systolic}
                onChange={(e, { value }) => setFormData({ ...formData, systolic: String(value) })}
                min={60}
                max={250}
                step={1}
                required
              />
            </Column>
            <Column sm={4} md={4} lg={8}>
              <NumberInput
                id="diastolic-pressure"
                label={t('diastolic', 'Diastolic (mmHg)')}
                placeholder="Diastolic pressure"
                value={formData.diastolic}
                onChange={(e, { value }) => setFormData({ ...formData, diastolic: String(value) })}
                min={30}
                max={150}
                step={1}
                required
              />
            </Column>
          </Grid>
        );

      case 'temperature':
        return (
          <NumberInput
            id="temperature-input"
            label={t('temperature', 'Temperature (°C)')}
            placeholder="Enter temperature (36-39)"
            value={formData.measurementValue}
            onChange={(e, { value }) => setFormData({ ...formData, measurementValue: String(value) })}
            min={35}
            max={42}
            step={0.1}
            required
          />
        );

      case 'urine-analysis':
        return (
          <Grid>
            <Column sm={4} md={2} lg={5}>
              <Select
                id="protein-level"
                labelText={t('proteinLevel', 'Protein Level')}
                value={formData.proteinLevel}
                onChange={(e) => setFormData({ ...formData, proteinLevel: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectLevel', 'Select level')} />
                <SelectItem value="1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="0" />
                <SelectItem value="1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="+" />
                <SelectItem value="1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="++" />
                <SelectItem value="1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="+++" />
              </Select>
            </Column>
            <Column sm={4} md={3} lg={5}>
              <Select
                id="glucose-level"
                labelText={t('glucoseLevel', 'Glucose Level')}
                value={formData.glucoseLevel}
                onChange={(e) => setFormData({ ...formData, glucoseLevel: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectLevel', 'Select level')} />
                <SelectItem value="1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="0" />
                <SelectItem value="1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="+" />
                <SelectItem value="1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="++" />
                <SelectItem value="1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="+++" />
              </Select>
            </Column>
            <Column sm={4} md={3} lg={6}>
              <Select
                id="ketone-level"
                labelText={t('ketoneLevel', 'Ketone Level')}
                value={formData.ketoneLevel}
                onChange={(e) => setFormData({ ...formData, ketoneLevel: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectLevel', 'Select level')} />
                <SelectItem value="1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="0" />
                <SelectItem value="1362AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="+" />
                <SelectItem value="1363AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="++" />
                <SelectItem value="1364AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="+++" />
              </Select>
            </Column>
          </Grid>
        );

      case 'drugs-fluids':
        return (
          <Grid>
            <Column sm={4} md={4} lg={8}>
              <TextInput
                id="medication-input"
                labelText={t('medication', 'Medication/Fluid')}
                placeholder="Enter medication or fluid type"
                value={formData.medication}
                onChange={(e) => setFormData({ ...formData, medication: (e.target as HTMLInputElement).value })}
                required
              />
            </Column>
            <Column sm={4} md={4} lg={8}>
              <TextInput
                id="dosage-input"
                labelText={t('dosageRate', 'Dosage/Rate')}
                placeholder="Enter dosage or flow rate"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: (e.target as HTMLInputElement).value })}
                required
              />
            </Column>
          </Grid>
        );

      case 'progress-events':
        return (
          <Grid>
            <Column sm={4} md={8} lg={16}>
              <Select
                id="event-type"
                labelText={t('eventType', 'Event Type')}
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: (e.target as HTMLSelectElement).value })}
                required>
                <SelectItem value="" text={t('selectEventType', 'Select event type')} />
                <SelectItem value="membrane-rupture" text={t('membraneRupture', 'Membrane Rupture')} />
                <SelectItem value="labor-onset" text={t('laborOnset', 'Labor Onset')} />
                <SelectItem value="position-change" text={t('positionChange', 'Position Change')} />
                <SelectItem value="medication-given" text={t('medicationGiven', 'Medication Given')} />
                <SelectItem value="complication" text={t('complication', 'Complication')} />
                <SelectItem value="delivery" text={t('delivery', 'Delivery')} />
                <SelectItem value="other" text={t('other', 'Other')} />
              </Select>
            </Column>
            <Column sm={4} md={8} lg={16}>
              <TextArea
                id="event-description"
                labelText={t('eventDescription', 'Event Description')}
                placeholder="Describe the event or milestone"
                value={formData.eventDescription}
                onChange={(e) =>
                  setFormData({ ...formData, eventDescription: (e.target as HTMLTextAreaElement).value })
                }
                rows={3}
                required
              />
            </Column>
          </Grid>
        );

      default:
        return (
          <TextInput
            id="general-measurement"
            labelText={getMeasurementLabel()}
            placeholder="Enter measurement value"
            value={formData.measurementValue}
            onChange={(e) => setFormData({ ...formData, measurementValue: (e.target as HTMLInputElement).value })}
            required
          />
        );
    }
  };

  return (
    <Modal
      open={isOpen}
      onRequestClose={onClose}
      modalHeading={`${getMeasurementLabel()} Data`}
      modalLabel={`${patientName}, ${patientGender}, ${patientAge}`}
      primaryButtonText={t('save', 'Save')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestSubmit={handleSubmit}
      onSecondarySubmit={handleCancel}
      size="md"
      className={styles.partographyModal}
      hasScrollingContent={false}>
      <div className={styles.modalContent}>
        <Form className={styles.dataEntryForm} onSubmit={handleSubmit}>
          <Grid>
            {/* First row - three dropdowns */}
            <Column sm={4} md={8} lg={5}>
              <Select
                id="admission-select"
                labelText={t('admission', 'Admission')}
                value={formData.admission}
                onChange={(e) => setFormData({ ...formData, admission: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectAdmission', 'Select admission')} />
                <SelectItem value="normal" text={t('normal', 'Normal')} />
                <SelectItem value="emergency" text={t('emergency', 'Emergency')} />
                <SelectItem value="elective" text={t('elective', 'Elective')} />
                <SelectItem value="referral" text={t('referral', 'Referral')} />
              </Select>
            </Column>

            <Column sm={4} md={8} lg={5}>
              <Select
                id="bg-select"
                labelText={t('bg', 'BG')}
                value={formData.bg}
                onChange={(e) => setFormData({ ...formData, bg: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectBG', 'Select BG')} />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="A+" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="A-" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="B+" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="B-" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="AB+" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="AB-" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="O+" />
                <SelectItem value="300AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" text="O-" />
              </Select>
            </Column>

            <Column sm={4} md={8} lg={6}>
              <Select
                id="am-select"
                labelText={t('am', 'AM')}
                value={formData.am}
                onChange={(e) => setFormData({ ...formData, am: (e.target as HTMLSelectElement).value })}>
                <SelectItem value="" text={t('selectAM', 'Select AM')} />
                <SelectItem value="morning" text={t('morning', 'Morning')} />
                <SelectItem value="afternoon" text={t('afternoon', 'Afternoon')} />
                <SelectItem value="evening" text={t('evening', 'Evening')} />
                <SelectItem value="night" text={t('night', 'Night')} />
              </Select>
            </Column>
          </Grid>
          <div className={styles.measurementSection}>{renderSpecificFields()}</div>
        </Form>
      </div>
    </Modal>
  );
};

export default PartographyDataForm;
