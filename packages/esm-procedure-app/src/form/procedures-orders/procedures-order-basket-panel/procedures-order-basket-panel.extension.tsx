import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import { Add, ChevronDown, ChevronUp } from '@carbon/react/icons';
import { useLayoutType, closeWorkspace } from '@openmrs/esm-framework';
import { launchPatientWorkspace, type OrderBasketItem, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { ProceduresOrderBasketItemTile } from './procedures-order-basket-item-tile.component';
import { prepProceduresOrderPostData } from '../api';
import ProcedureIcon from './procedures-icon.component';
import styles from './procedures-order-basket-panel.scss';
import { type ProcedureOrderBasketItem } from '../../../types';

export default function ProceduresOrderBasketPanelExtension() {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<ProcedureOrderBasketItem>('procedures', prepProceduresOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const {
    incompleteOrderBasketItems,
    newOrderBasketItems,
    renewedOrderBasketItems,
    revisedOrderBasketItems,
    discontinuedOrderBasketItems,
  } = useMemo(() => {
    const incompleteOrderBasketItems: Array<ProcedureOrderBasketItem> = [];
    const newOrderBasketItems: Array<ProcedureOrderBasketItem> = [];
    const renewedOrderBasketItems: Array<ProcedureOrderBasketItem> = [];
    const revisedOrderBasketItems: Array<ProcedureOrderBasketItem> = [];
    const discontinuedOrderBasketItems: Array<ProcedureOrderBasketItem> = [];

    orders.forEach((order) => {
      if (order?.isOrderIncomplete) {
        incompleteOrderBasketItems.push(order);
      } else if (order.action === 'NEW') {
        newOrderBasketItems.push(order);
      } else if (order.action === 'RENEW') {
        renewedOrderBasketItems.push(order);
      } else if (order.action === 'REVISE') {
        revisedOrderBasketItems.push(order);
      } else if (order.action === 'DISCONTINUE') {
        discontinuedOrderBasketItems.push(order);
      }
    });

    return {
      incompleteOrderBasketItems,
      newOrderBasketItems,
      renewedOrderBasketItems,
      revisedOrderBasketItems,
      discontinuedOrderBasketItems,
    };
  }, [orders]);

  const openNewProceduresForm = useCallback(() => {
    console.warn('closing basket');
    closeWorkspace('order-basket', {
      ignoreChanges: true,
      onWorkspaceClose: () => {
        console.warn('basket closed');
        launchPatientWorkspace('add-procedures-order');
      },
    });
  }, []);

  const openEditProceduresForm = useCallback((order: OrderBasketItem) => {
    closeWorkspace('order-basket', {
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('add-procedures-order', { order }),
    });
  }, []);

  const removeLabOrder = useCallback(
    (order: ProcedureOrderBasketItem) => {
      const newOrders = [...orders];
      newOrders.splice(orders.indexOf(order), 1);
      setOrders(newOrders);
    },
    [orders, setOrders],
  );

  useEffect(() => {
    setIsExpanded(orders.length > 0);
  }, [orders]);

  return (
    <Tile
      className={classNames(isTablet ? styles.tabletTile : styles.desktopTile, {
        [styles.collapsedTile]: !isExpanded,
      })}>
      <div className={styles.container}>
        <div className={styles.iconAndLabel}>
          <ProcedureIcon isTablet={isTablet} />
          <h4 className={styles.heading}>{`${t('proceduresOrders', 'Procedures orders')} (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add procedures order"
            onClick={openNewProceduresForm}
            size={isTablet ? 'md' : 'sm'}>
            {t('add', 'Add')}
          </Button>
          <Button
            className={styles.chevron}
            hasIconOnly
            kind="ghost"
            renderIcon={(props) =>
              isExpanded ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
            }
            iconDescription="View"
            disabled={orders.length === 0}
            onClick={() => setIsExpanded(!isExpanded)}>
            {t('add', 'Add')}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <>
          {orders.length > 0 && (
            <>
              {incompleteOrderBasketItems.length > 0 && (
                <>
                  {incompleteOrderBasketItems.map((order) => (
                    <ProceduresOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditProceduresForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}
              {newOrderBasketItems.length > 0 && (
                <>
                  {newOrderBasketItems.map((order) => (
                    <ProceduresOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditProceduresForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}

              {renewedOrderBasketItems.length > 0 && (
                <>
                  {renewedOrderBasketItems.map((order) => (
                    <ProceduresOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditProceduresForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}

              {revisedOrderBasketItems.length > 0 && (
                <>
                  {revisedOrderBasketItems.map((order) => (
                    <ProceduresOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditProceduresForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}

              {discontinuedOrderBasketItems.length > 0 && (
                <>
                  {discontinuedOrderBasketItems.map((order) => (
                    <ProceduresOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditProceduresForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
    </Tile>
  );
}
