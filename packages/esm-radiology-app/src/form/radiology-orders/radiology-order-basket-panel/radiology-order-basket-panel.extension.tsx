import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import { Add, ChevronDown, ChevronUp } from '@carbon/react/icons';
import { useLayoutType, closeWorkspace } from '@openmrs/esm-framework';
import { launchPatientWorkspace, type OrderBasketItem, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { RadiologyOrderBasketItemTile } from './radiology-order-basket-item-tile.component';
import { prepRadiologyOrderPostData } from '../api';
import ImagingIcon from './radiology-icon.component';
import styles from './radiology-order-basket-panel.scss';
import { type RadiologyOrderBasketItem } from '../../../types';

/**
 * Designs: https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/648c44d9d4052c613e7f23da
 */
export default function RadiologyOrderBasketPanelExtension() {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<RadiologyOrderBasketItem>('radiology', prepRadiologyOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const {
    incompleteOrderBasketItems,
    newOrderBasketItems,
    renewedOrderBasketItems,
    revisedOrderBasketItems,
    discontinuedOrderBasketItems,
  } = useMemo(() => {
    const incompleteOrderBasketItems: Array<RadiologyOrderBasketItem> = [];
    const newOrderBasketItems: Array<RadiologyOrderBasketItem> = [];
    const renewedOrderBasketItems: Array<RadiologyOrderBasketItem> = [];
    const revisedOrderBasketItems: Array<RadiologyOrderBasketItem> = [];
    const discontinuedOrderBasketItems: Array<RadiologyOrderBasketItem> = [];

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

  const openNewRadiologyForm = useCallback(() => {
    closeWorkspace('order-basket', {
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('add-radiology-order'),
    });
  }, []);

  const openEditRadiologyForm = useCallback((order: OrderBasketItem) => {
    closeWorkspace('order-basket', {
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('add-radiology-order', { order }),
    });
  }, []);

  const removeLabOrder = useCallback(
    (order: RadiologyOrderBasketItem) => {
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
          <ImagingIcon isTablet={isTablet} />
          <h4 className={styles.heading}>{`${t('radiologyOrders', 'Radiology orders')} (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add radiology order"
            onClick={openNewRadiologyForm}
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
                    <RadiologyOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditRadiologyForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}
              {newOrderBasketItems.length > 0 && (
                <>
                  {newOrderBasketItems.map((order) => (
                    <RadiologyOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditRadiologyForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}

              {renewedOrderBasketItems.length > 0 && (
                <>
                  {renewedOrderBasketItems.map((order) => (
                    <RadiologyOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditRadiologyForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}

              {revisedOrderBasketItems.length > 0 && (
                <>
                  {revisedOrderBasketItems.map((order) => (
                    <RadiologyOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditRadiologyForm(order)}
                      onRemoveClick={() => removeLabOrder(order)}
                    />
                  ))}
                </>
              )}

              {discontinuedOrderBasketItems.length > 0 && (
                <>
                  {discontinuedOrderBasketItems.map((order) => (
                    <RadiologyOrderBasketItemTile
                      key={order.uuid}
                      orderBasketItem={order}
                      onItemClick={() => openEditRadiologyForm(order)}
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
