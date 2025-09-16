import React from 'react';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Layer, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { parseDate, formatDatetime } from '@openmrs/esm-framework';
import { PriorityPill, StatusPill } from './OrderPills';
import { type Order } from '../../types/order/order';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

type OrderTableProps = {
  title: string;
  orders: Order[];
  onAdd: () => void;
  containerClassName: string;
  tableCellClassName: string;
  priorityPillClassName: string;
  statusPillClassName: string;
};

const defaultHeaders = (t: (k: string, d: string) => string) => [
  { header: t('orderNo', 'Order No'), key: 'orderNo' },
  { header: t('dateOrdered', 'Date Ordered'), key: 'dateOrdered' },
  { header: t('order', 'Order'), key: 'order' },
  { header: t('priority', 'Priority'), key: 'priority' },
  { header: t('orderBy', 'Order By'), key: 'orderBy' },
  { header: t('status', 'Status'), key: 'status' },
];

export const OrderTable: React.FC<OrderTableProps> = ({
  title,
  orders,
  onAdd,
  containerClassName,
  tableCellClassName,
  priorityPillClassName,
  statusPillClassName,
}) => {
  const { t } = useTranslation();

  const rows = orders.map((order) => ({
    id: order.uuid,
    orderNo: order.orderNumber,
    dateOrdered: formatDatetime(parseDate(order.dateActivated), { mode: 'standard' }),
    order: order.concept?.display?.replace('_', ' ') ?? '--',
    priority: <PriorityPill value={order.urgency} className={priorityPillClassName} dataAttrName="priority" />,
    orderBy: order.orderer?.display ?? '--',
    status: <StatusPill value={order.fulfillerStatus} className={statusPillClassName} dataAttrName="status" />,
  }));

  if (orders?.length === 0) {
    return <Layer />;
  }

  return (
    <div className={containerClassName}>
      <CardHeader title={title}>
        <Button onClick={onAdd} kind="ghost" renderIcon={Add}>
          {t('addOrder', 'Add Order')}
        </Button>
      </CardHeader>
      <DataTable size="sm" useZebraStyles headers={defaultHeaders(t)} isSortable rows={rows}>
        {({ getHeaderProps, getRowProps, getTableProps, headers, rows }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell className={tableCellClassName} key={cell.id}>
                      {cell.value?.['content'] ?? cell.value}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default OrderTable;
