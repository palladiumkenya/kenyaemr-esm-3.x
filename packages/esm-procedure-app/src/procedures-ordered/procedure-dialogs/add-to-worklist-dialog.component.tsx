import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Checkbox,
  TextInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './add-to-worklist-dialog.scss';
import { showNotification, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { Renew } from '@carbon/react/icons';
import {
  GenerateSpecimenId,
  UpdateOrder,
  useReferralLocations,
  useSpecimenTypes,
} from './add-to-worklist-dialog.resource';
import { Order } from '../../types';

interface AddToWorklistDialogProps {
  queueId;
  order: Order;
  closeModal: () => void;
}

const AddToWorklistDialog: React.FC<AddToWorklistDialogProps> = ({ queueId, order, closeModal }) => {
  const { t } = useTranslation();

  const [preferred, setPreferred] = useState(false);

  const [specimenID, setSpecimenID] = useState('');

  const { specimenTypes } = useSpecimenTypes();

  const { referrals } = useReferralLocations();

  const [specimenType, setSpecimenType] = useState();

  const [selectedReferral, setSelectedReferral] = useState('');

  const [barcode, setBarcode] = useState('');

  const [confirmBarcode, setConfirmBarcode] = useState('');

  const [externalReferralName, setExternalReferralName] = useState('');

  const config = useConfig();

  const pickProcedureRequestQueue = async (event) => {
    event.preventDefault();
    // pick procedure
    const body = {
      sampleId: specimenID,
      specimenSourceId: specimenType,
      unProcessedOrders: '',
      patientQueueId: queueId,
    };

    UpdateOrder(order.uuid, body).then(
      () => {
        showSnackbar({
          isLowContrast: true,
          title: t('pickedAnOrder', 'Picked an order'),
          kind: 'success',
          subtitle: t('pickSuccessfully', 'You have successfully picked an Order'),
        });
        closeModal();
      },
      (error) => {
        showNotification({
          title: t(`errorPicking an order', 'Error Picking an Order`),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  };

  const onChecked = () => {
    setPreferred(!preferred);
  };

  const generateId = async (e) => {
    e.preventDefault();
    // generate sample Id
    GenerateSpecimenId(order.uuid).then(
      (resp) => {
        setSpecimenID(resp.data.results[0].sampleId);
        showSnackbar({
          isLowContrast: true,
          title: t('generatesampleID', 'Generate Sample Id'),
          kind: 'success',
          subtitle: t('generateSuccessfully', 'You have successfully generated a Sample Id'),
        });
      },
      (err) => {
        showNotification({
          title: t(`errorGeneratingId', 'Error Generating Sample Id`),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
  };

  useEffect(() => {
    if (barcode !== '' && confirmBarcode !== '' && barcode == confirmBarcode) {
      setSpecimenID(barcode);
    }
  }, [barcode, confirmBarcode]);

  return (
    <div>
      <Form onSubmit={pickProcedureRequestQueue}>
        <ModalHeader closeModal={closeModal} title={t('pickRequest', 'Pick Request')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <section className={styles.section}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  alignContent: 'stretch',
                }}>
                <div className={styles.sectionTitle}>
                  {preferred ? t('barcode', 'Barcode') : t('specimenID', 'Procedure Id')}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    columnGap: '10px',
                  }}>
                  <div style={{ width: '430px' }}>
                    <TextInput
                      type="text"
                      id="specimentId"
                      value={specimenID}
                      readOnly={
                        config.enableSpecimenIdAutoGeneration ? config.enableSpecimenIdAutoGeneration : preferred
                      }
                      hideReadOnly={preferred}
                      onChange={(e) => setSpecimenID(e.target.value)}
                    />
                  </div>

                  <div style={{ width: '50px' }}>
                    {config.enableSpecimenIdAutoGeneration && (
                      <Button
                        hasIconOnly
                        onClick={(e) => generateId(e)}
                        renderIcon={(props) => <Renew size={16} {...props} />}
                        disabled={preferred}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
            <section className={styles.section}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  alignContent: 'stretch',
                }}>
                <div className={styles.sectionTitle}>{t('specimenType', 'Specimen Type')}</div>
                <div style={{ width: '500px' }}>
                  <section className={styles.section}>
                    <Select
                      labelText=""
                      id="speciment-types"
                      name="specimen-types"
                      value={specimenType}
                      onChange={(event) => setSpecimenType(event.target.value)}>
                      {!specimenType ? <SelectItem text={t('specimenType', 'Select Specimen Type')} value="" /> : null}
                      {specimenTypes.map((type) => (
                        <SelectItem key={type.uuid} text={type.display} value={type.uuid}>
                          {type.display}
                        </SelectItem>
                      ))}
                    </Select>
                  </section>
                </div>
              </div>
            </section>
            <section
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                alignContent: 'stretch',
              }}>
              <div>
                <Checkbox checked={preferred} onChange={onChecked} labelText={'Referred'} id="test-referred" />
              </div>
              {preferred && (
                <div style={{ width: '500px' }}>
                  <section className={styles.section}>
                    <Select
                      labelText={t('locationReferral', 'Referral Location ')}
                      id="nextQueueLocation"
                      name="nextQueueLocation"
                      invalidText="Required"
                      value={selectedReferral}
                      onChange={(event) => setSelectedReferral(event.target.value)}>
                      {referrals.map((referral) => (
                        <SelectItem key={referral.uuid} text={referral.display} value={referral.uuid}>
                          {referral.display}
                        </SelectItem>
                      ))}
                    </Select>
                  </section>

                  <section className={styles.section}>
                    {selectedReferral === '3476fd97-71da-4e9c-bf57-2b6318dc0c9f' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        <div style={{ width: '500px' }}>
                          <TextInput
                            type="text"
                            id="locationName"
                            labelText={'Enter Name'}
                            value={externalReferralName}
                            required={true}
                            onChange={(e) => setExternalReferralName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                      <div style={{ width: '500px' }}>
                        <TextInput
                          type="text"
                          id="enterBarcode"
                          labelText={'Enter Barcode'}
                          value={barcode}
                          required={true}
                          onChange={(e) => {
                            setBarcode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                      <div style={{ width: '500px' }}>
                        <TextInput
                          type="text"
                          id="confirmBarcode"
                          labelText={'Confirm Barcode'}
                          value={confirmBarcode}
                          required={true}
                          onChange={(e) => {
                            setConfirmBarcode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" onClick={pickProcedureRequestQueue}>
            {t('pickPatient', 'Pick Order Request')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default AddToWorklistDialog;
