import React from 'react';
import {
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  StructuredListWrapper,
  Layer,
  Checkbox,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { convertToCurrency, extractString } from '../../helpers';
import { MappedBill, LineItem } from '../../types';
import styles from './bill-manager.scss';
import { launchWorkspace } from '@openmrs/esm-framework';

const PatientBillsSelections: React.FC<{ bills: MappedBill }> = ({ bills }) => {
  const { t } = useTranslation();

  const handleOpenWorkspace = (workspace: { title: string; name: string }) => {
    launchWorkspace(workspace.name, {
      workspaceTitle: workspace.title,
    });
  };

  return (
    <Layer>
      <StructuredListWrapper className={styles.billListContainer} isCondensed selection={true}>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>{t('billItem', 'Bill item')}</StructuredListCell>
            <StructuredListCell head>{t('quantity', 'Quantity')}</StructuredListCell>
            <StructuredListCell head>{t('unitPrice', 'Unit Price')}</StructuredListCell>
            <StructuredListCell head>{t('total', 'Total')}</StructuredListCell>
            <StructuredListCell head>{t('actions', 'Actions')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {bills?.lineItems.map((lineItem) => (
            <StructuredListRow>
              <StructuredListCell>
                {lineItem.item === '' ? extractString(lineItem.billableService) : extractString(lineItem.item)}
              </StructuredListCell>
              <StructuredListCell>{lineItem.quantity}</StructuredListCell>
              <StructuredListCell>{convertToCurrency(lineItem.price)}</StructuredListCell>
              <StructuredListCell>{convertToCurrency(lineItem.price * lineItem.quantity)}</StructuredListCell>
              <StructuredListCell>
                <OverflowMenu aria-label="overflow-menu" align="bottom">
                  <OverflowMenuItem
                    itemText="Waive BIll"
                    onClick={() => handleOpenWorkspace({ name: 'waive-bill-form', title: 'Waive Bill Form' })}
                  />
                  <OverflowMenuItem
                    itemText="Cancel Bill"
                    onClick={() => handleOpenWorkspace({ name: 'cancel-bill-form', title: 'Cancel Bill Form' })}
                  />
                  <OverflowMenuItem
                    itemText="Edit Bill"
                    onClick={() => handleOpenWorkspace({ name: 'edit-bill-form', title: 'Edit Bill Form' })}
                  />
                  <OverflowMenuItem
                    itemText="Delete Bill"
                    onClick={() => handleOpenWorkspace({ name: 'delete-bill-form', title: 'Delete Bill Form' })}
                  />
                </OverflowMenu>
              </StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </Layer>
  );
};

export default PatientBillsSelections;
