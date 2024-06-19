import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  TextArea,
  Form,
  Layer,
  Stack,
  TextInput,
  Row,
  ButtonSet,
  Button,
  FilterableMultiSelect,
  MultiSelect,
} from '@carbon/react';
import styles from './claims-form.scss';
import { MappedBill } from '../../../types';
import { formatDate, navigate } from '@openmrs/esm-framework';
import { useSystemSetting } from '../../../hooks/getMflCode';
import { useParams } from 'react-router-dom';
import { useVisit } from './claims-form.resource';

type ClaimsFormProps = {
  bill: MappedBill;
};

const ClaimsForm: React.FC<ClaimsFormProps> = ({ bill }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { patientUuid, billUuid } = useParams();
  const { visits: recentVisit } = useVisit(patientUuid);
  const handleNavigateToBillingOptions = () =>
    navigate({
      to: window.getOpenmrsSpaBase() + `home/billing/patient/${patientUuid}/${billUuid}`,
    });

  const encounterProviders =
    recentVisit?.encounters.flatMap((encounter) =>
      encounter.encounterProviders.map((provider) => ({
        id: provider.uuid,
        text: provider.display,
      })),
    ) || [];

  const diagnoses = useMemo(
    () =>
      recentVisit?.encounters.flatMap(
        (encounter) =>
          encounter.diagnoses.map((diagnosis) => ({
            id: diagnosis.uuid,
            text: diagnosis.display,
            certainty: diagnosis.certainty,
          })) || [],
      ) || [],
    [recentVisit],
  );

  const confirmedDiagnoses = useMemo(
    () => diagnoses.filter((diagnosis) => diagnosis.certainty === 'CONFIRMED'),
    [diagnoses],
  );

  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);

  useEffect(() => {
    setSelectedDiagnoses(confirmedDiagnoses);
  }, [confirmedDiagnoses]);

  const handleDiagnosesChange = ({ selectedItems }) => {
    setSelectedDiagnoses(selectedItems);
  };

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
                value={recentVisit?.visitType.display || 'Wait for visit type'}
              />
            </Layer>
          </Column>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <TextInput
                id="facility"
                invalidText="Required"
                labelText={t('facility', 'Facility')}
                value={`${recentVisit?.location.display || ''} - ${mflCodeValue || 'Wait for facility name'}`}
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
                  recentVisit?.startDatetime
                    ? formatDate(new Date(recentVisit?.startDatetime), { mode: 'standard' })
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
                  recentVisit?.stopDatetime
                    ? formatDate(new Date(recentVisit?.stopDatetime), { mode: 'standard' })
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
              items={diagnoses}
              itemToString={(item) => (item ? item.text : '')}
              selectionFeedback="top-after-reopen"
              selectedItems={selectedDiagnoses}
              onChange={handleDiagnosesChange}
            />
          </Layer>
        </Column>
        <Row className={styles.formClaimRow}>
          <Column className={styles.formClaimColumn}>
            <Layer className={styles.input}>
              <FilterableMultiSelect
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
          <Button className={styles.button} kind="secondary" onClick={handleNavigateToBillingOptions}>
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
