import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatManilaDateTime } from '../../lib/dateTime'
import { formatPrice } from '../../lib/posCalculations'
import type { OrderHistoryRow } from '../../types/order'

export function TransactionTable({ orders, emptyMessage, onView }: { orders: OrderHistoryRow[]; emptyMessage: string; onView: (order: OrderHistoryRow) => void }) {
  const columns: TableColumn<OrderHistoryRow>[] = [
    { key: 'number', header: 'Order No.', render: (order) => order.orderNumber },
    { key: 'date', header: 'Date / Time', render: (order) => formatManilaDateTime(order.orderedAt) },
    { key: 'station', header: 'Station', render: (order) => order.station.name },
    { key: 'cashier', header: 'Cashier', render: (order) => order.cashier.name },
    { key: 'payment', header: 'MOP', render: (order) => order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod === 'credit' ? 'Credit / Utang' : order.paymentMethod },
    { key: 'total', header: 'Total', align: 'right', render: (order) => formatPrice(order.totalAmount) },
    { key: 'actions', header: 'Action', align: 'center', render: (order) => <Button className="table-icon-action" variant="outline" aria-label={`View details for ${order.orderNumber}`} title={`View details for ${order.orderNumber}`} onClick={() => onView(order)} icon={<AppIcons.view size={iconSize} strokeWidth={iconStroke} />} /> }
  ]
  return <Table columns={columns} rows={orders} rowKey={(order) => String(order.id)} emptyMessage={emptyMessage} />
}
