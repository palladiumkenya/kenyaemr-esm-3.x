import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Stack, Select, SelectItem, TextInput } from '@carbon/react';
import styles from './visit-billing-info.scss';

type VisitBillingInfoProps = { setBillingComponent: Function };

type BillingInfoData = {
  patientType: string;
  paymentMethod: string;
  insuranceSchema: string;
  policyNumber: string;
  nonPayingPatientCategory: string;
};

const initialValue = {
  patientType: '',
  paymentMethod: '',
  insuranceSchema: '',
  policyNumber: '',
  nonPayingPatientCategory: '',
};

function billingInfoReducer(state: BillingInfoData, action): BillingInfoData {
  switch (action.type) {
    case 'SET_PATIENT_TYPE':
      return { ...state, patientType: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_INSURANCE_SCHEMA':
      return { ...state, insuranceSchema: action.payload };
    case 'SET_POLICY_NUMBER':
      return { ...state, policyNumber: action.payload };
    case 'SET_NON_PAYING_PATIENT_CATEGORY':
      return {
        patientType: state.patientType,
        insuranceSchema: '',
        paymentMethod: '',
        policyNumber: '',
        nonPayingPatientCategory: action.payload,
      };
    default:
      throw new Error('Unhandled action type');
  }
}

const VisitBillingInfo: React.FC<VisitBillingInfoProps> = ({ setBillingComponent }) => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(billingInfoReducer, initialValue);

  return (
    <>
      <Stack className={styles.stackSection}>
        <div className={styles.sectionTitle}>{t('patientType', 'Patient type')}</div>
        <RadioButtonGroup
          legendText={t('selectPatientType', 'Select patient type')}
          orientation="vertical"
          onChange={(e) => dispatch({ type: 'SET_PATIENT_TYPE', payload: e })}
          name="patientType">
          <RadioButton labelText={t('paying', 'Paying')} value="payingPatientType" id="payingPatientType" />
          <RadioButton
            labelText={t('nonPaying', 'Non paying')}
            value="nonPayingPatientType"
            id="nonPayingPatientType"
          />
        </RadioButtonGroup>
        {state.patientType === 'payingPatientType' && (
          <Select
            onChange={(e) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: e.target.value })}
            id={`paymentMethod`}
            labelText="Payment method">
            <SelectItem value="" text="" />
            <SelectItem id="cash" value="cash" text="Cash" />
            <SelectItem id="mpesa" value="mpesa" text="MPESA" />
            <SelectItem id="insurance" value="insurance" text="Insurance" />
          </Select>
        )}
        {state.paymentMethod === 'insurance' && state.patientType === 'payingPatientType' && (
          <>
            <Select
              id={`insuranceScheme`}
              onChange={(e) => dispatch({ type: 'SET_INSURANCE_SCHEMA', payload: e.target.value })}
              labelText="Insurance scheme">
              <SelectItem value="" text="" />
              <SelectItem value="option-1" text="NHIF" />
              <SelectItem value="option-2" text="Jubilee Insurance" />
              <SelectItem value="option-3" text="Old mutual" />
            </Select>
            <TextInput
              onChange={(e) => dispatch({ type: 'SET_POLICY_NUMBER', payload: e })}
              id="policyNumber"
              type="text"
              labelText={t('policyNumber', 'Policy Number')}
            />
          </>
        )}

        {/* Non paying patient section */}
        {state.patientType === 'nonPayingPatientType' && (
          <Select
            id={`patientCategory`}
            onChange={(e) => dispatch({ type: 'SET_NON_PAYING_PATIENT_CATEGORY', payload: e })}
            labelText={t('patientCategory', 'Patient catergory')}>
            <SelectItem value="" text="" />
            <SelectItem value="option-1" text="Refugee" />
            <SelectItem value="option-2" text="Under 5 years old" />
            <SelectItem value="option-3" text="Senior citizen" />
            <SelectItem value="option-4" text="Prision inmate" />
            <SelectItem value="option-5" text="Other" />
          </Select>
        )}
      </Stack>
    </>
  );
};

export default VisitBillingInfo;
