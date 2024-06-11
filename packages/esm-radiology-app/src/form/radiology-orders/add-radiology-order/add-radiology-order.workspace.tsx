import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { DefaultWorkspaceProps, age, formatDate, parseDate, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { TestTypeSearch } from './radiology-type-search';
import { RadiologyOrderForm } from './radiology-order-form.component';
import styles from './add-radiology-order.scss';
import { type RadiologyOrderBasketItem } from '../../../types';

export interface AddRadiologyOrderWorkspaceAdditionalProps {
  order?: RadiologyOrderBasketItem;
}

export interface AddRadiologyOrderWorkspace extends DefaultWorkspaceProps, AddRadiologyOrderWorkspaceAdditionalProps {}

export default function AddRadiologyOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: AddRadiologyOrderWorkspace) {
  const { t } = useTranslation();

  const { patient, isLoading: isLoadingPatient } = usePatient();
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as RadiologyOrderBasketItem);

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
        <TestTypeSearch openLabForm={setCurrentLabOrder} />
      ) : (
        <RadiologyOrderForm
          initialOrder={currentLabOrder}
          closeWorkspace={closeWorkspace}
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          promptBeforeClosing={promptBeforeClosing}
        />
      )}
    </div>
  );
}
