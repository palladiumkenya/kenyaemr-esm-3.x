import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, Form, Stack, Search, ButtonSet, ComboBox, Button, Tile, TextArea } from '@carbon/react';
import { ExtensionSlot, showSnackbar, useSession } from '@openmrs/esm-framework';
import PatientInfo from './referral-patient-info.component';
import styles from './referral.workspace.scss';
import { useReason, useFacility, Concept, Facility } from './referral-workspace.resource';

type FacilityReferralProp = {
  closeWorkspace: () => void;
};

const FacilityReferralForm: React.FC<FacilityReferralProp> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const { user } = useSession();
  const [patientUuid, setPatientUuid] = useState('');
  const [patientSelected, setPatientSelected] = useState(false);
  const [reasonSearchTerm, setReasonSearchTerm] = useState('');
  const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<Concept[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [referralType, setReferralType] = useState('');
  const { data: reasons, error: reasonsError } = useReason(reasonSearchTerm);
  const { data: facilities, error: facilitiesError } = useFacility(facilitySearchTerm);

  const onSubmit = async (data) => {
    try {
      showSnackbar({
        kind: 'success',
        title: t('referSuccess', 'Facility Referral'),
        subtitle: t('facilityRefer', 'Patient referred successfully'),
        timeoutInMs: 3000,
        isLowContrast: true,
      });
      closeWorkspace();
    } catch (err) {
      console.error(err);
      showSnackbar({
        kind: 'error',
        title: t('referError', 'Facility Referral Error'),
        subtitle: t('RlshipError', 'Referral request Failed.......'),
        timeoutInMs: 2500,
        isLowContrast: true,
      });
    }
  };

  const selectPatient = (patientUuid) => {
    setPatientUuid(patientUuid);
    setPatientSelected(true);
  };

  const handleReasonSearchChange = (e) => {
    setReasonSearchTerm(e.target.value);
  };

  const handleFacilitySearchChange = (e) => {
    setFacilitySearchTerm(e.target.value);
  };

  const handleReasonSelect = (reason) => {
    if (!selectedReasons.find((r) => r.uuid === reason.uuid)) {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleFacilitySelect = (facility) => {
    setSelectedFacility(facility);
    setFacilitySearchTerm('');
  };

  const handleRemoveReason = (uuid) => {
    setSelectedReasons(selectedReasons.filter((reason) => reason.uuid !== uuid));
  };

  const handleRemoveFacility = () => {
    setSelectedFacility(null);
  };

  const handleReferralTypeChange = (e) => {
    setReferralType(e.selectedItem);
  };

  return (
    <Form className={styles.form} onSubmit={onSubmit}>
      <span className={styles.formTitle}>{t('formTitle', 'Fill in the form details')}</span>
      <Stack gap={4} className={styles.grid}>
        <span className={styles.sectionHeader}>Select referral type</span>
        <Column>
          <ComboBox
            id="select-referral-type"
            placeholder="Select referral type"
            items={['Facility to Facility']}
            onChange={handleReferralTypeChange}
          />
        </Column>

        {referralType === 'Facility to Facility' && (
          <>
            <span className={styles.sectionHeader}>Search for facility to refer to</span>
            <Column>
              {!selectedFacility && (
                <Search
                  size="lg"
                  placeholder="Facility to refer patient to"
                  labelText="Search"
                  closeButtonLabelText="Clear"
                  id="facility-search"
                  value={facilitySearchTerm}
                  onChange={handleFacilitySearchChange}
                />
              )}
              {facilitySearchTerm && facilities && (
                <div className={styles.facilityList}>
                  {facilities.map((facility) => (
                    <Tile
                      key={facility.uuid}
                      className={styles.facilityTile}
                      onClick={() => handleFacilitySelect(facility)}
                      role="button"
                      tabIndex={0}>
                      {facility.name} - {facility.attributes[0]?.value}
                    </Tile>
                  ))}
                </div>
              )}
              {selectedFacility && (
                <Tile key={selectedFacility.uuid} className={styles.facilityTile} onClick={handleRemoveFacility}>
                  {selectedFacility.name} - {selectedFacility.attributes[0].value}
                </Tile>
              )}
            </Column>
          </>
        )}
        <span className={styles.sectionHeader}>Search for patient</span>
        {patientSelected && <PatientInfo patientUuid={patientUuid} />}
        {!patientSelected && (
          <Column>
            <ExtensionSlot
              name="patient-search-bar-slot"
              state={{
                selectPatientAction: selectPatient,
                buttonProps: {
                  kind: 'primary',
                },
              }}
            />
          </Column>
        )}
        <span className={styles.sectionHeader}>Search for referral reasons</span>
        <Column>
          <Search
            size="lg"
            placeholder="Search for reasons for referral"
            labelText="Search"
            closeButtonLabelText="Clear reason"
            id="reason-for-referral"
            value={reasonSearchTerm}
            onChange={handleReasonSearchChange}
          />
          {reasonSearchTerm && reasons && (
            <div className={styles.reasonList}>
              {reasons.map((reason) => (
                <Tile
                  key={reason.uuid}
                  className={styles.reasonTile}
                  onClick={() => handleReasonSelect(reason)}
                  role="button"
                  tabIndex={0}>
                  {reason.name.name}
                </Tile>
              ))}
            </div>
          )}
        </Column>
        {selectedReasons.length > 0 && (
          <Column className={styles.textbox}>
            <span className={styles.sectionHeader}>Selected Reasons</span>
            <div className={styles.selectedReasons}>
              {selectedReasons.map((reason) => (
                <Tile key={reason.uuid} className={styles.reasonTile} onClick={() => handleRemoveReason(reason.uuid)}>
                  {reason.name.name}
                </Tile>
              ))}
            </div>
          </Column>
        )}
        <span className={styles.sectionHeader}>Clinical Notes</span>
        <Column>
          <TextArea rows={4} id="text-area-1" className={styles.reasonTextbox} />
        </Column>
      </Stack>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={!patientSelected}>
          {t('refer', 'Refer Patient')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default FacilityReferralForm;
