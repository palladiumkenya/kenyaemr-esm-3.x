import React from 'react';
import { Drug } from '@openmrs/esm-patient-common-lib';
import { DosingUnit, MedicationFrequency, MedicationRoute, QuantityUnit } from '../../types';
import { useBillableItem, useSockItemInventory } from './useBilliableItem';
import { useTranslation } from 'react-i18next';
import styles from './drug-order.scss';
import { convertToCurrency } from '../../helpers';

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
      {stockItem && (
        <div className={styles.itemContainer}>
          <span className={styles.bold}>
            {t('inStock', '{{quantityUoM}}(s) In stock ', { quantityUoM: stockItem?.quantityUoM })}
          </span>
          <span>{Math.round(stockItem?.quantity)}</span>
        </div>
      )}
      <div>
        {billableItem &&
          billableItem?.servicePrices.map((item) => (
            <div key={item.uuid} className={styles.itemContainer}>
              <span className={styles.bold}>{t('unitPrice', 'Unit price ')}</span>
              <span>{convertToCurrency(item.price)}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DrugOrder;
