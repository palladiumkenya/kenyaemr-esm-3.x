import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  Form,
  Layer,
  Stack,
  TextInput,
  Row,
  DatePicker,
  ButtonSet,
  Button,
  DatePickerInput,
} from '@carbon/react';
import styles from './claims-form.scss';

const ClaimsForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Form className={styles.form}>
      <span className={styles.claimFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Layer className={styles.input}>
            <TextInput
              id="claimExplanation"
              invalidText="Required"
              placeholder="Claim Explanation"
              labelText={t('claimExplanation', 'Claim Explanation')}
            />
          </Layer>
        </Column>
        <Row className={styles.facilityVisitRow}>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <DatePicker datePickerType="single">
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText={t('treatmentstart', 'Treatment Start')}
                  id="date-picker-single-claims-1"
                  size="xl"
                  className={styles.datePickerInput}
                />
              </DatePicker>
            </Layer>
          </Column>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <DatePicker datePickerType="single">
                <DatePickerInput
                  placeholder="mm/dd/yyyy"
                  labelText={t('treatmentend', 'Treatment End')}
                  id="date-picker-single-claims-2"
                  size="xl"
                  className={styles.datePickerInput}
                />
              </DatePicker>
            </Layer>
          </Column>
        </Row>
        <Row className={styles.facilityVisitRow}>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="visitType"
                invalidText="Required"
                placeholder="Visit Type"
                labelText={t('visitType', ' Visit Type')}
              />
            </Layer>
          </Column>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="facility"
                invalidText="Required"
                placeholder="Facility"
                labelText={t('facility', 'Facility')}
              />
            </Layer>
          </Column>
        </Row>
        <Row className={styles.facilityVisitRow}>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="claimcode"
                invalidText="Required"
                placeholder="Claim Code"
                labelText={t('claimcode', ' Claim Code')}
              />
            </Layer>
          </Column>
          <Column className={styles.facilityColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="guarantee"
                invalidText="Required"
                placeholder="Guarantee ID"
                labelText={t('guarantee', 'Guarantee ID')}
              />
            </Layer>
          </Column>
        </Row>
        <Column>
          <Layer className={styles.input}>
            <TextInput
              id="diagnosis"
              invalidText="Required"
              placeholder="Diagnosis"
              labelText={t('diagnosis', 'Diagnosis')}
            />
          </Layer>
        </Column>
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="danger">
          {t('discardClaim', 'Discard Claim')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('processClaim', 'Process Claim')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ClaimsForm;
