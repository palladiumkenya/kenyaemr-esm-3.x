import React, { useState } from 'react';

import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  Accordion,
  AccordionItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './review-radiology-report-dialog.scss';
import { Result } from '../../work-list/work-list.resource';
import { showNotification, showSnackbar } from '@openmrs/esm-framework';
import { updateProdedure } from '../../test-ordered/pick-radiology-order/add-to-worklist-dialog.resource';
import { mutate } from 'swr';
interface ReviewOrderDialogProps {
  order: Result;
  closeModal: () => void;
}

const ReviewOrderDialog: React.FC<ReviewOrderDialogProps> = ({ order, closeModal }) => {
  const { t } = useTranslation();

  const [notes, setNotes] = useState('');
  const tableData = [
    { key: 'Order Urgency', value: order.urgency },
    {
      key: 'Schedule date',
      value: order.scheduledDate || new Date().toLocaleDateString(),
    },
    { key: 'Body Site', value: order.display },
    { key: 'Laterality', value: order.laterality },
    { key: 'Number of repeats', value: order.numberOfRepeats },
    { key: 'Frequency', value: order.frequency?.display },
  ];
  const procedureTableData = [{ key: 'Lab Results: ', value: order?.procedures[0]?.procedureReport }];

  const updateProcedures = async (event) => {
    event.preventDefault();
    const body = {
      outcome: 'SUCCESSFUL',
    };
    updateProdedure(order?.procedures[0].uuid, body)
      .then(() => {
        showSnackbar({
          isLowContrast: true,
          title: t('createResponse', 'Create Review'),
          kind: 'success',
          subtitle: t('pickSuccessfully', 'You have successfully created a review'),
        });
        closeModal();
        mutate((key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/procedure'), undefined, {
          revalidate: true,
        });
      })
      .catch((error) => {
        showNotification({
          title: t(`errorPicking', 'Error Creating Review`),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      });
  };

  return (
    <div>
      <Form onSubmit={updateProcedures}>
        <ModalHeader closeModal={closeModal} title={t('reviewReport', 'Review Radiology Report')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <section className={styles.infoSection}>
              <Accordion>
                <AccordionItem title={t('procedureInstructions', 'Procedure Instructions')}>
                  <p>
                    <Table size="lg" useZebraStyles={false} aria-label="sample table">
                      <TableBody>
                        {tableData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.key}</TableCell>
                            <TableCell>{row.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </p>
                </AccordionItem>
                <AccordionItem title={t('procedureReport', 'Procedure Report')}>
                  <p>
                    <Table size="lg" useZebraStyles={false} aria-label="sample table">
                      <TableBody>
                        {procedureTableData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.key}</TableCell>
                            <TableCell>{row.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </p>
                </AccordionItem>
              </Accordion>
            </section>
            <section className={styles.textAreaInput}>
              <TextArea
                labelText={t('nextNotes', "Reviewer's notes ")}
                id="nextNotes"
                name="nextNotes"
                onChange={(e) => setNotes(e.target.value)}
              />
            </section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="danger" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" type="submit">
            {t('approve', 'Approve')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default ReviewOrderDialog;
