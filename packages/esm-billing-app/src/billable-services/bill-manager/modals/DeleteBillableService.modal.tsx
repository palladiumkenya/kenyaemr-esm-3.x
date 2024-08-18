import React, { useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Loading } from '@carbon/react';
import styles from './cancel-bill.scss';
import { useTranslation } from 'react-i18next';
import { OpenmrsResource, showSnackbar } from '@openmrs/esm-framework';
import { deleteBillableService } from '../../billable-service.resource';

export const DeleteBillableServiceModal: React.FC<{
  onClose: () => void;
  service: OpenmrsResource;
}> = ({ onClose, service }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const deleteService = () => {
    setIsLoading(true);
    onClose();
    deleteBillableService(service?.uuid)
      .then(() => {
        showSnackbar({
          title: t('billableService', 'Billable Service'),
          subtitle: t('serviceHasBeenSuccessfullyDeleted', 'Service has been successfully deleted.'),
          kind: 'success',
          timeoutInMs: 3000,
        });
      })
      .catch((error) => {
        showSnackbar({
          title: t('anErrorhasOccuredTryingToDeleteService', 'An error occurred trying to delete service'),
          kind: 'error',
          subtitle: error.message,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <React.Fragment>
      <ModalHeader onClose={onClose} className={styles.modalHeaderHeading} closeModal={onClose}>
        {t('deleteBillableService', 'Delete Billable Service')}
      </ModalHeader>
      <ModalBody>
        <div className={styles.contentcontainer}>
          <div>
            Service Name : <b className={styles.contentvalue}>{service?.name}</b>
          </div>
          <div>
            Short Name : <b className={styles.contentvalue}>{service?.shortName}</b>
          </div>
          <div>
            Service Type : <b className={styles.contentvalue}>{service?.serviceType?.display}</b>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={deleteService}>
          {isLoading ? (
            <div className={styles.loading_wrapper}>
              <Loading className={styles.button_spinner} withOverlay={false} small />
              {t('deletingBillableService', 'Deleting Billable Service')}
            </div>
          ) : (
            t('deleteService', 'Delete Service')
          )}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
