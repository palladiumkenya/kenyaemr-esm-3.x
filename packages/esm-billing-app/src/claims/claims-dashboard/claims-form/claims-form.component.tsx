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
  MultiSelect,
  ButtonSet,
  Button,
  DatePickerInput,
} from '@carbon/react';
import styles from './claims-form.scss';
import { MappedBill } from '../../../types';
import { formatDate, useSession, useVisit } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';

type ClaimsFormProps = {
  bill: MappedBill;
};

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill }) => {
  const { t } = useTranslation();
  const session = useSession();
  const location = session?.sessionLocation?.display;
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const [facilityDisplay, setFacilityDisplay] = useState('facility');
  const { patientUuid } = useParams();
  const { currentVisit } = useVisit(patientUuid);
  const encounterProviders =
    currentVisit?.encounters.flatMap((encounter) =>
      encounter.encounterProviders.map((provider) => ({
        id: provider.uuid,
        text: provider.display,
      })),
    ) || [];

  // const diagnoses =
  //   currentVisit?.encounters.flatMap(
  //     (encounter) =>
  //       encounter.?.map((diagnosis) => ({
  //         id: diagnosis.uuid,
  //         text: diagnosis.display,
  //       })) || [],
  //   ) || [];
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
              <TextInput
                id="visitType"
                invalidText="Required"
                labelText={t('visitType', 'Visit Type')}
                value={currentVisit?.visitType?.display || '__'}
              />
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
                value={
                  currentVisit?.startDatetime
                    ? formatDate(new Date(currentVisit?.startDatetime), { mode: 'standard' })
                    : '--/--/----'
                }
              />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="treatmentend"
                invalidText="Required"
                labelText={t('treatmentend', 'Treatment End')}
                value={
                  currentVisit?.stopDatetime
                    ? formatDate(new Date(currentVisit?.stopDatetime), { mode: 'standard' })
                    : '--/--/----'
                }
              />
            </Layer>
          </Column>
        </Row>
        <Column>
          <Layer className={styles.input}>
            <MultiSelect
              id="diagnoses"
              titleText={t('diagnoses', 'Diagnoses')}
              items=""
              itemToString={(item) => (item ? item.text : '')}
              selectionFeedback="top-after-reopen"
            />
          </Layer>
        </Column>
        <Row className={styles.formClaimRow}>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <MultiSelect
                id="provider_name"
                titleText={t('provider_name', 'Provider Name')}
                items={encounterProviders}
                itemToString={(item) => (item ? item.text : '')}
                selectionFeedback="top-after-reopen"
              />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="claimcode"
                invalidText="Required"
                placeholder="Claim Code"
                labelText={t('claimcode', 'Claim Code')}
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
