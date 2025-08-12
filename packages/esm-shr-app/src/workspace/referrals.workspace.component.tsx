import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Column,
  Form,
  Stack,
  Search,
  ButtonSet,
  ComboBox,
  Button,
  Tile,
  TextArea,
  InlineLoading,
  Tag,
} from '@carbon/react';
import { ExtensionSlot, showSnackbar, useSession, useConfig, formatDate, formatDatetime } from '@openmrs/esm-framework';
import { z } from 'zod';
import PatientInfo from './referral-patient-info.component';
import styles from './referral.workspace.scss';
import { Hospital, Close } from '@carbon/react/icons';
import {
  useFacilities,
  useReasons,
  useSendReferralToArtDirectory,
  useSystemSetting,
} from './referral-workspace.resource';
import usePatient from '../hooks/usePatient';
import { type Concept, type Facility, type ReferralPayload } from '../types';
import { FacilityReferralFormData, facilityReferralSchema, ValidationErrors } from '../schema';
import {
  getPatientName,
  getPatientGender,
  getPatientIdentifiers,
  formatBirthDate,
  getPatientAddress,
  getPatientDeathInfo,
  getPhoneNumber,
} from '../utils/function';

interface FacilityReferralProps {
  closeWorkspace: () => void;
  patientUuid?: string;
}

const FacilityReferralForm: React.FC<FacilityReferralProps> = ({ closeWorkspace, patientUuid: initialPatientUuid }) => {
  const { t } = useTranslation();
  const { mflCodeValue } = useSystemSetting('facility.mflcode');
  const { mutate: sendReferral } = useSendReferralToArtDirectory();

  const sendingFacilityMflCode = mflCodeValue;

  const [patientUuid, setPatientUuid] = useState(initialPatientUuid || '');
  const [patientSelected, setPatientSelected] = useState(!!initialPatientUuid);
  const [reasonSearchTerm, setReasonSearchTerm] = useState('');
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<Concept[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [referralType, setReferralType] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const { data: reasons } = useReasons(reasonSearchTerm);
  const { data: facilities } = useFacilities(facilitySearchTerm);
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);

  const getPatientIdentifier = (type: string) => {
    if (!patient?.identifiers?.length) {
      return '';
    }

    const identifier = patient.identifiers?.find((id) =>
      id.identifierType?.name?.toLowerCase().includes(type.toLowerCase()),
    );

    return identifier?.identifier || '';
  };

  const validateForm = (): boolean => {
    try {
      const formData: FacilityReferralFormData = {
        referralType,
        patientUuid,
        selectedFacility,
        selectedReasons,
        clinicalNotes,
      };

      facilityReferralSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FacilityReferralFormData;
          errors[path] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const buildReferralPayload = (formData: FacilityReferralFormData): ReferralPayload => {
    const receivingFacilityMflCode = selectedFacility.attributes?.[0]?.value || '';
    const deathInfo = getPatientDeathInfo(patient);

    return {
      MESSAGE_HEADER: {
        SENDING_APPLICATION: 'KENYAEMR',
        SENDING_FACILITY: sendingFacilityMflCode || '18080',
        RECEIVING_APPLICATION: 'IL',
        RECEIVING_FACILITY: receivingFacilityMflCode || '11161',
        MESSAGE_DATETIME: formatDatetime(new Date(), { mode: 'standard' }),
        SECURITY: null,
        MESSAGE_TYPE: 'SIU^S20',
        PROCESSING_ID: 'P',
      },
      PATIENT_IDENTIFICATION: {
        EXTERNAL_PATIENT_ID: {
          ID: null,
          IDENTIFIER_TYPE: 'GODS_NUMBER',
          ASSIGNING_AUTHORITY: 'MPI',
        },
        INTERNAL_PATIENT_ID: getPatientIdentifiers(patient),
        PATIENT_NAME: getPatientName(patient),
        MOTHER_NAME: {
          FIRST_NAME: null,
          MIDDLE_NAME: null,
          LAST_NAME: null,
        },
        DATE_OF_BIRTH: formatBirthDate(patient),
        SEX: getPatientGender(patient),
        PATIENT_ADDRESS: {
          PHYSICAL_ADDRESS: getPatientAddress(patient),
          POSTAL_ADDRESS: null,
        },
        PHONE_NUMBER: getPhoneNumber(patient),
        MARITAL_STATUS: null,
        DEATH_DATE: deathInfo.DEATH_DATE,
        DEATH_INDICATOR: deathInfo.DEATH_INDICATOR,
        DATE_OF_BIRTH_PRECISION: 'EXACT',
      },
      DISCONTINUATION_MESSAGE: {
        DISCONTINUATION_REASON: 'TRANSFER OUT',
        EFFECTIVE_DISCONTINUATION_DATE: formatDate(new Date(), { mode: 'standard' }),
        TARGET_PROGRAM: 'HIV',
        SERVICE_REQUEST: {
          TRANSFER_STATUS: 'ACTIVE',
          TRANSFER_INTENT: 'ORDER',
          TRANSFER_PRIORITY: 'ASAP',
          TRANSFER_OUT_DATE: formatDate(new Date(), { mode: 'standard' }),
          TO_ACCEPTANCE_DATE: null,
          SENDING_FACILITY_MFLCODE: sendingFacilityMflCode || '18080',
          RECEIVING_FACILITY_MFLCODE: receivingFacilityMflCode || '11161',
          SUPPORTING_INFO: formData.clinicalNotes || null,
        },
      },
    };
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      showSnackbar({
        kind: 'error',
        title: t('validationError', 'Validation Error'),
        subtitle: t('fixValidationErrors', 'Please fix the validation errors and try again'),
        timeoutInMs: 4000,
      });
      return;
    }

    if (isLoadingPatient) {
      showSnackbar({
        kind: 'warning',
        title: t('patientLoading', 'Patient Loading'),
        subtitle: t('waitForPatientData', 'Please wait for patient data to load'),
        timeoutInMs: 4000,
      });
      return;
    }

    if (!selectedFacility) {
      showSnackbar({
        kind: 'error',
        title: t('facilityMissing', 'Facility Missing'),
        subtitle: t('selectDestinationFacility', 'Please select a destination facility.'),
        timeoutInMs: 4000,
      });
      return;
    }

    const hasMinimumPatientData = patientSelected && !!patientUuid;

    if (!hasMinimumPatientData) {
      showSnackbar({
        kind: 'error',
        title: t('patientDataMissing', 'Patient Data Missing'),
        subtitle: t(
          'patientDataNotLoaded',
          'Patient data could not be loaded. Please try selecting the patient again.',
        ),
        timeoutInMs: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: FacilityReferralFormData = {
        referralType,
        patientUuid,
        selectedFacility,
        selectedReasons,
        clinicalNotes,
      };

      const payload = buildReferralPayload(formData);
      await sendReferral(payload);

      showSnackbar({
        kind: 'success',
        title: t('referSuccess', 'Referral Successful'),
        subtitle: t('facilityReferSuccess', `Patient successfully referred to ${selectedFacility?.name}`),
        timeoutInMs: 5000,
      });

      closeWorkspace();
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('referError', 'Referral Failed'),
        subtitle: t('referErrorDetails', error.message || 'An unexpected error occurred'),
        timeoutInMs: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectPatient = (selectedPatientUuid: string) => {
    setPatientUuid(selectedPatientUuid);
    setPatientSelected(true);

    if (validationErrors.patientUuid) {
      setValidationErrors((prev) => ({ ...prev, patientUuid: undefined }));
    }
  };

  const handleReasonSelect = (reason: Concept) => {
    if (!selectedReasons.some((r) => r.uuid === reason.uuid)) {
      const newReasons = [...selectedReasons, reason];
      setSelectedReasons(newReasons);
      setReasonSearchTerm('');

      if (validationErrors.selectedReasons) {
        setValidationErrors((prev) => ({ ...prev, selectedReasons: undefined }));
      }
    }
  };

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setFacilitySearchTerm('');

    if (validationErrors.selectedFacility) {
      setValidationErrors((prev) => ({ ...prev, selectedFacility: undefined }));
    }
  };

  const handleRemoveReason = (uuid: string) => {
    setSelectedReasons(selectedReasons.filter((reason) => reason.uuid !== uuid));
  };

  const isFormValid = useMemo(() => {
    const checks = {
      hasReferralType: !!referralType,
      hasPatientUuid: !!patientUuid,
      hasFacility: !!selectedFacility,
      hasReasons: selectedReasons.length > 0,
      hasNotes: clinicalNotes.length >= 10,
      patientSelectedCorrectly: patientSelected && !!patientUuid,
      notLoadingPatient: !isLoadingPatient,
      noPatientError: !patientError,
    };

    return Object.values(checks).every(Boolean);
  }, [
    referralType,
    patientUuid,
    selectedFacility,
    selectedReasons,
    clinicalNotes,
    patientSelected,
    isLoadingPatient,
    patientError,
  ]);

  return (
    <Form className={styles.form} onSubmit={onSubmit}>
      <Stack gap={4} className={styles.grid}>
        <h3 className={styles.formTitle}>{t('facilityReferral', 'Facility Referral')}</h3>

        <Column>
          <ComboBox
            id="referral-type"
            titleText={t('referralType', 'Referral Type')}
            items={['Facility to Facility']}
            onChange={({ selectedItem }) => {
              setReferralType(selectedItem);
            }}
            placeholder={t('selectReferralType', 'Select referral type')}
            selectedItem={referralType}
            invalid={!!validationErrors.referralType}
            invalidText={validationErrors.referralType}
          />
        </Column>

        {referralType && (
          <>
            <Column>
              <h4 className={styles.sectionHeader}>{t('destinationFacility', 'Destination Facility')}</h4>
              {!selectedFacility ? (
                <>
                  <Search
                    size="lg"
                    placeholder={t('searchFacility', 'Search for facility')}
                    labelText={t('search', 'Search')}
                    value={facilitySearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFacilitySearchTerm(value);
                    }}
                  />
                  {facilitySearchTerm && facilities?.length > 0 && (
                    <div className={styles.searchResults}>
                      {facilities.map((facility) => (
                        <Tile
                          key={facility.uuid}
                          className={styles.resultTile}
                          onClick={() => handleFacilitySelect(facility)}>
                          <div className={styles.tileContent}>
                            <Hospital size={20} className={styles.illustrationPictogram} />
                            <div className={styles.facilityInfo}>
                              <strong>{facility.name}</strong>
                              <div>MFL: {facility.attributes?.[0]?.value || 'N/A'}</div>
                            </div>
                          </div>
                        </Tile>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Tile className={styles.selectedItem}>
                  <div className={styles.tileContent}>
                    <Hospital size={20} className={styles.illustrationPictogram} />
                    <div className={styles.facilityInfo}>
                      <strong>{selectedFacility.name}</strong>
                      <div>MFL: {selectedFacility.attributes?.[0]?.value || 'N/A'}</div>
                    </div>
                    <Button
                      hasIconOnly
                      renderIcon={Close}
                      iconDescription={t('remove', 'Remove')}
                      kind="ghost"
                      onClick={() => {
                        setSelectedFacility(null);
                      }}
                    />
                  </div>
                </Tile>
              )}
              {validationErrors.selectedFacility && (
                <div className={styles.errorMessage}>{validationErrors.selectedFacility}</div>
              )}
            </Column>

            <Column>
              <h4 className={styles.sectionHeader}>{t('patient', 'Patient')}</h4>
              {patientSelected && patientUuid ? (
                <PatientInfo patientUuid={patientUuid} />
              ) : (
                <ExtensionSlot
                  name="patient-search-bar-slot"
                  state={{
                    selectPatientAction: selectPatient,
                    buttonProps: { kind: 'primary' },
                  }}
                />
              )}
              {validationErrors.patientUuid && (
                <div className={styles.errorMessage}>{validationErrors.patientUuid}</div>
              )}
            </Column>

            <Column>
              <h4 className={styles.sectionHeader}>{t('referralReasons', 'Referral Reasons')}</h4>
              <Search
                size="lg"
                placeholder={t('searchReasons', 'Search for referral reasons')}
                labelText={t('search', 'Search')}
                value={reasonSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setReasonSearchTerm(value);
                }}
              />
              {reasonSearchTerm && reasons?.length > 0 && (
                <div className={styles.searchResults}>
                  {reasons.map((reason) => (
                    <Tile key={reason.uuid} className={styles.resultTile} onClick={() => handleReasonSelect(reason)}>
                      {reason.name.toString()}
                    </Tile>
                  ))}
                </div>
              )}
              {selectedReasons.length > 0 && (
                <div className={styles.selectedItems}>
                  {selectedReasons.map((reason) => (
                    <Tag key={reason.uuid} size="lg" type="gray" filter onClose={() => handleRemoveReason(reason.uuid)}>
                      {reason.name.toString()}
                    </Tag>
                  ))}
                </div>
              )}
              {validationErrors.selectedReasons && (
                <div className={styles.errorMessage}>{validationErrors.selectedReasons}</div>
              )}
            </Column>

            <Column>
              <h4 className={styles.sectionHeader}>{t('clinicalNotes', 'Clinical Notes')}</h4>
              <TextArea
                labelText={t('clinicalNotes', 'Clinical Notes')}
                rows={4}
                value={clinicalNotes}
                onChange={(e) => {
                  const value = e.target.value;
                  setClinicalNotes(value);

                  if (validationErrors.clinicalNotes) {
                    setValidationErrors((prev) => ({ ...prev, clinicalNotes: undefined }));
                  }
                }}
                invalid={!!validationErrors.clinicalNotes}
                invalidText={validationErrors.clinicalNotes}
              />
            </Column>
          </>
        )}
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button kind="secondary" onClick={closeWorkspace} disabled={isSubmitting}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" type="submit" disabled={isSubmitting || !isFormValid || isLoadingPatient}>
          {isSubmitting ? (
            <InlineLoading description={t('submitting', 'Submitting...')} />
          ) : (
            t('submitReferral', 'Submit Referral')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default FacilityReferralForm;
