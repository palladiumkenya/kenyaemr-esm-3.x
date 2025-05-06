import React from 'react';
import { ModalBody, ModalFooter, Button, InlineLoading, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type ChargeAble } from '../../billables/charge-summary.resource';
import { deleteBillableService } from '../../billable-service.resource';
import { showSnackbar, restBaseUrl } from '@openmrs/esm-framework';
import { mutate } from 'swr';

type DeleteBillableServiceModalProps = {
  closeModal: () => void;
  chargeableItem: ChargeAble;
};

const DeleteBillableServiceModal: React.FC<DeleteBillableServiceModalProps> = ({ closeModal, chargeableItem }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { t } = useTranslation();

  const handleMutation = () => {
    const url = `${restBaseUrl}/cashier/billableService`;
    mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    const chargeableItemUuid = chargeableItem?.uuid;
    if (chargeableItemUuid) {
      deleteBillableService(chargeableItemUuid)
        .then(() => {
          showSnackbar({
            title: t('deleteChargeableItemSuccess', 'Chargeable item deleted successfully'),
            subtitle: t('deleteChargeableItemSuccessMessage', 'The chargeable item has been deleted successfully.'),
            kind: 'success',
            isLowContrast: true,
            timeoutInMs: 5000,
          });
          handleMutation();
          closeModal();
        })
        .catch((error) => {
          showSnackbar({
            title: t('deleteChargeableItemError', 'Error deleting chargeable item'),
            subtitle: t('deleteChargeableItemErrorMessage', 'An error occurred while deleting the chargeable item.'),
            isLowContrast: true,
            timeoutInMs: 5000,
            kind: 'error',
          });
        })
        .finally(() => {
          setIsDeleting(false);
        });
    }
  };
  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('deleteChargeableItems', 'Delete Chargeable Item')} />
      <ModalBody>
        <p>
          {t('deleteChargeableItemMessage', 'Are you sure you want to delete the chargeable item {{name}}?', {
            name: chargeableItem?.name,
          })}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteBillableServiceModal;
