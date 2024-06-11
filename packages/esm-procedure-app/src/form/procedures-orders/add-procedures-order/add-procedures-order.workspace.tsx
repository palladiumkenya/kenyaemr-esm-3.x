import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { DefaultWorkspaceProps, age, formatDate, parseDate, usePatient, useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { TestTypeSearch } from './procedures-type-search';
import { ProceduresOrderForm } from './procedures-order-form.component';
import styles from './add-procedures-order.scss';
import { type ProcedureOrderBasketItem } from '../../../types';

export interface AddProcedureOrderWorkspaceAdditionalProps {
  order?: OrderBasketItem;
}

export interface AddProceduresOrderWorkspace extends DefaultWorkspaceProps, AddProcedureOrderWorkspaceAdditionalProps {}

export default function AddProceduresOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: AddProceduresOrderWorkspace) {
  const { t } = useTranslation();

  const { patient, isLoading: isLoadingPatient } = usePatient();
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as ProcedureOrderBasketItem);

  const isTablet = useLayoutType() === 'tablet';

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  const cancelOrder = useCallback(() => {
    closeWorkspace({
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [closeWorkspace]);

  return (
    <div className={styles.container}>
      {isTablet && !isLoadingPatient && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>
              {formatDate(parseDate(patient?.birthDate), {
                mode: 'wide',
                time: false,
              })}
            </span>
          </span>
        </div>
      )}
      {!isTablet && (
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowLeft size={24} {...props} />}
            iconDescription="Return to order basket"
            size="sm"
            onClick={cancelOrder}>
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
      {!currentLabOrder ? (
        <div>
          <TestTypeSearch openLabForm={setCurrentLabOrder} />
        </div>
      ) : (
        <div>
          <ProceduresOrderForm
            initialOrder={currentLabOrder}
            closeWorkspace={closeWorkspace}
            closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
            promptBeforeClosing={promptBeforeClosing}
          />
        </div>
      )}
    </div>
  );
}
