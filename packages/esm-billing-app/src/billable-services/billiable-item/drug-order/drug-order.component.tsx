import React from 'react';
import { Drug } from '@openmrs/esm-patient-common-lib';
import { DosingUnit, MedicationFrequency, MedicationRoute, QuantityUnit } from '../../../types';
import { useBillableItem, useSockItemInventory } from '../useBillableItem';
import { useTranslation } from 'react-i18next';
import styles from './drug-order.scss';
import { convertToCurrency } from '../../../helpers';

type DrugOrderProps = {
  order: {
    drug: Drug;
    unit: DosingUnit;
    commonMedicationName: string;
    dosage: number;
    frequency: MedicationFrequency;
    route: MedicationRoute;
    quantityUnits: QuantityUnit;
    patientInstructions: string;
    asNeeded: boolean;
    asNeededCondition: string;
  };
};

const DrugOrder: React.FC<DrugOrderProps> = ({ order }) => {
  const { t } = useTranslation();
  const { stockItem, isLoading: isLoadingInventory } = useSockItemInventory(order?.drug?.uuid);
  const { billableItem, isLoading } = useBillableItem(order?.drug.concept.uuid);
  if (isLoading || isLoadingInventory) {
    return null;
  }
  return (
    <div className={styles.drugOrderContainer}>
      {stockItem && stockItem.length > 0 ? (
        <>
          <div className={styles.bold}>{'In Stock'}</div>
          {stockItem.map((item, index) => (
            <div key={index} className={styles.itemContainer}>
              <span>{item.partyName}</span>
              <span>
                {' '}
                {Math.round(item.quantity)} {item.quantityUoM}(s){' '}
              </span>
            </div>
          ))}
        </>
      ) : (
        <div className={styles.red}>{'Drug Is Not Available  / Out of Stock'}</div>
      )}

      <div>
        {billableItem &&
          billableItem?.servicePrices.map((item) => (
            <div key={item.uuid} className={styles.itemContainer}>
              <span className={styles.bold}>{item.paymentMode.name}</span>
              <span>{convertToCurrency(item.price)}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DrugOrder;
