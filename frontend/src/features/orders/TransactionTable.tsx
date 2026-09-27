import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatPrice } from '../../lib/posCalculations'
import type { OrderHistoryRow } from '../../types/order'

export function TransactionTable({ orders, emptyMessage, onView }: { orders: OrderHistoryRow[]; emptyMessage: string; onView: (order: OrderHistoryRow) => void }) {
  const columns: TableColumn<OrderHistoryRow>[] = [
    { key: 'number', header: 'Order No.', render: (order) => <strong>{order.orderNumber}</strong> },
    { key: 'date', header: 'Date / Time', render: (order) => new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.orderedAt)) },
    { key: 'station', header: 'Station', render: (order) => order.station.name },
    { key: 'cashier', header: 'Cashier', render: (order) => order.cashier.name },
    { key: 'payment', header: 'MOP', render: (order) => order.paymentMethod === 'cash' ? 'Cash' : order.paymentMethod },
    { key: 'total', header: 'Total', align: 'right', render: (order) => <strong>{formatPrice(order.totalAmount)}</strong> },
    { key: 'actions', header: 'Actions', align: 'right', render: (order) => <Button variant="outline" onClick={() => onView(order)} icon={<AppIcons.info size={iconSize} strokeWidth={iconStroke} />}>View Details</Button> }
  ]
  return <Table columns={columns} rows={orders} rowKey={(order) => String(order.id)} emptyMessage={emptyMessage} />
}
