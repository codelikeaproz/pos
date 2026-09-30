import { Table, type TableColumn } from '../../components/ui/Table'
import { formatPrice, formatQuantity } from '../../lib/posCalculations'
import type { OrderDetail } from '../../types/order'

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const columns: TableColumn<OrderDetail['items'][number]>[] = [
    { key: 'item', header: 'Item', render: (item) => <div><strong>{item.itemName}</strong><small className="transaction-item-code">{item.itemCode} · {item.unit}</small></div> },
    { key: 'quantity', header: 'Qty', align: 'right', render: (item) => formatQuantity(item.quantity) },
    { key: 'price', header: 'Unit Price', align: 'right', render: (item) => formatPrice(item.unitPrice) },
    { key: 'subtotal', header: 'Subtotal', align: 'right', render: (item) => <strong>{formatPrice(item.subtotal)}</strong> }
  ]
  return <div className="transaction-detail">
    <dl className="transaction-detail__meta"><div><dt>Order No.</dt><dd>{order.orderNumber}</dd></div><div><dt>Date</dt><dd>{new Intl.DateTimeFormat('en-PH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(order.orderedAt))}</dd></div><div><dt>Station</dt><dd>{order.station.name}</dd></div><div><dt>Cashier</dt><dd>{order.cashier.name}</dd></div><div><dt>Payment</dt><dd>{order.paymentMethod === 'credit' ? 'Credit / Utang' : 'Cash'}</dd></div>{order.customer ? <div><dt>Customer</dt><dd>{order.customer.name}</dd></div> : null}</dl>
    <h3>Items</h3><Table columns={columns} rows={order.items} rowKey={(item) => `${item.itemId}-${item.itemCode}`} />
    <dl className="transaction-detail__totals"><div><dt>Total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>{order.paymentMethod === 'cash' ? <><div><dt>Cash</dt><dd>{order.cashReceived ? formatPrice(order.cashReceived) : '—'}</dd></div><div><dt>Change</dt><dd>{order.changeAmount ? formatPrice(order.changeAmount) : '—'}</dd></div></> : null}</dl>
  </div>
}
