import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  TextArea,
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
import { MappedBill } from '../../../types';
import { useSession } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';

type ClaimsFormProps = {
  bill: MappedBill;
};

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const [facilityDisplay, setFacilityDisplay] = useState('facility');

  useEffect(() => {
    if (location) {
      setFacilityDisplay(`${location}${mflCodeValue ? ` - (${mflCodeValue})` : ''}`);
    }
  }, [location, mflCodeValue]);

  return (
    <Form className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.claimFormTitle}>{t('formTitle', 'Fill in the form details')}</span>
        <Row className={styles.formClaimRow}>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput id="visitType" invalidText="Required" labelText={t('visitType', ' Visit Type')} value="" />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="facility"
                invalidText="Required"
                labelText={t('facility', 'Facility')}
                value={facilityDisplay}
              />
            </Layer>
          </Column>
        </Row>
        <Row className={styles.formClaimRow}>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="treatmentstart"
                invalidText="Required"
                labelText={t('treatmentstart', 'Treatment Start')}
                value={bill.dateCreated ? bill.dateCreated : '--/--/----'}
                readOnly
              />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
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
        <Row className={styles.formClaimRow}>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="claimcode"
                invalidText="Required"
                placeholder="Claim Code"
                labelText={t('claimcode', ' Claim Code')}
              />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
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
            <TextArea
              labelText={t('claimExplanation', 'Claim Explanation')}
              invalidText="Required"
              rows={4}
              placeholder="Claim Explanation"
              id="claimExplanation"
            />
          </Layer>
        </Column>
        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="danger">
            {t('discardClaim', 'Discard Claim')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit">
            {t('processClaim', 'Process Claim')}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default ClaimsForm;
