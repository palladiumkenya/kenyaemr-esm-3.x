import React, { useState } from 'react';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, Checkbox, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './add-to-worklist-dialog.scss';
import { showNotification, showSnackbar } from '@openmrs/esm-framework';
import { updateOrder } from './add-to-worklist-dialog.resource';
import { Result } from '../../work-list/work-list.resource';
import { mutate } from 'swr';

interface AddProcedureToWorklistDialogProps {
  queueId;
  order: Result;
  closeModal: () => void;
}

const AddProcedureToWorklistDialog: React.FC<AddProcedureToWorklistDialogProps> = ({ queueId, order, closeModal }) => {
  const { t } = useTranslation();

  const [isReferredChecked, setIsReferredChecked] = useState(false);
  const [referredLocation, setReferredLocation] = useState('');

  const pickProcedureRequestQueue = async (event) => {
    event.preventDefault();

    const body = {
      fulfillerComment: '',
      fulfillerStatus: isReferredChecked ? 'EXCEPTION' : 'IN_PROGRESS',
      // referralLocation: isReferredChecked ? referredLocation : "",
    };

    updateOrder(order.uuid, body)
      .then(() => {
        showSnackbar({
          isLowContrast: true,
          title: t('pickedAnOrder', 'Picked an order'),
          kind: 'success',
          subtitle: t('pickSuccessfully', 'You have successfully picked an Order'),
        });
        closeModal();
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/order'), undefined, {
          revalidate: true,
        });
      })
      .catch((error) => {
        showNotification({
          title: t(`errorPicking an order', 'Error Picking an Order`),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      });
  };

  const handleCheckboxChange = () => {
    setIsReferredChecked(!isReferredChecked);
  };

  return (
    <div>
      <Form onSubmit={pickProcedureRequestQueue}>
        <ModalHeader closeModal={closeModal} title={t('pickRequest', 'Pick Request')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <section className={styles.section}>
              <Checkbox
                checked={isReferredChecked}
                onChange={handleCheckboxChange}
                labelText={t('referredProcedure', 'Referred')}
                id="test-referred"
              />
              {isReferredChecked && (
                <TextInput
                  type="text"
                  id="referredLocation"
                  labelText={t('enterReferredLocation', 'Enter Referred Location')}
                  value={referredLocation}
                  onChange={(e) => setReferredLocation(e.target.value)}
                />
              )}
            </section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" onClick={pickProcedureRequestQueue}>
            {t('pickRequest', 'Pick Request')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default AddProcedureToWorklistDialog;
