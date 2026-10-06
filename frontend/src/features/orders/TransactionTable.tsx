import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatManilaDateTime } from '../../lib/dateTime'
import { formatPrice } from '../../lib/posCalculations'
import type { OrderHistoryRow } from '../../types/order'

export function TransactionTable({ orders, emptyMessage, showDateRemitted = false, onView }: { orders: OrderHistoryRow[]; emptyMessage: string; showDateRemitted?: boolean; onView: (order: OrderHistoryRow) => void }) {
  const columns: TableColumn<OrderHistoryRow>[] = [
    { key: 'number', header: 'Order No.', render: (order) => order.orderNumber },
    { key: 'date', header: 'Date / Time', render: (order) => formatManilaDateTime(order.orderedAt) },
    { key: 'station', header: 'Station', render: (order) => order.station.name },
    { key: 'cashier', header: 'Cashier', render: (order) => order.cashier.name },
    { key: 'payment', header: 'MOP', render: (order) => order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod === 'credit' ? 'Credit / Utang' : order.paymentMethod },
    { key: 'total', header: 'Total', align: 'right', render: (order) => formatPrice(order.totalAmount) },
    ...(showDateRemitted ? [{ key: 'remitted', header: 'Date Remitted', render: (order: OrderHistoryRow) => <Badge tone={order.remittedAt ? 'success' : 'warning'}>{order.remittedAt ? formatManilaDateTime(order.remittedAt) : 'Not Remitted'}</Badge> } satisfies TableColumn<OrderHistoryRow>] : []),
    { key: 'actions', header: 'Action', align: 'center', render: (order) => <Button className="table-icon-action" variant="outline" aria-label={`View details for ${order.orderNumber}`} title={`View details for ${order.orderNumber}`} onClick={() => onView(order)} icon={<AppIcons.view size={iconSize} strokeWidth={iconStroke} />} /> }
  ]
  return <Table columns={columns} rows={orders} rowKey={(order) => String(order.id)} rowClassName={(order) => showDateRemitted && order.remittedAt ? 'ui-table__row--success' : undefined} emptyMessage={emptyMessage} />
}
