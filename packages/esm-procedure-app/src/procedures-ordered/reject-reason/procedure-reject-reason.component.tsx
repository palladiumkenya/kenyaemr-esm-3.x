import React from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from '../procedure-instructions/instructions.scss';
import { Result } from '../../work-list/work-list.resource';

interface ProcedureRejectReasonModalProps {
  order: Result;
  closeModal: () => void;
}

const ProcedureRejectReasonModal: React.FC<ProcedureRejectReasonModalProps> = ({ order, closeModal }) => {
  const { t } = useTranslation();

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('reasonNotDone', 'Reason Not Done')} />
      <ModalBody>
        <div className={styles.modalBody}>
          <section className={styles.section}>
            <b />
            <Tile>
              <p>
                <b>Rejection Reason:</b>
              </p>
              <p className={styles.instructions}>{order.fulfillerComment}</p>
            </Tile>
          </section>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default ProcedureRejectReasonModal;
