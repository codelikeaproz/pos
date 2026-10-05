import { Table, type TableColumn } from '../../components/ui/Table'
import { formatManilaLongDateTime } from '../../lib/dateTime'
import { formatPrice, formatQuantity } from '../../lib/posCalculations'
import type { OrderDetail } from '../../types/order'

export function OrderDetailView({ order, showOrNumber = false }: { order: OrderDetail; showOrNumber?: boolean }) {
  const columns: TableColumn<OrderDetail['items'][number]>[] = [
    { key: 'item', header: 'Item', render: (item) => item.itemName },
    { key: 'code', header: 'Item Code', render: (item) => item.itemCode },
    { key: 'price', header: 'Unit Price', align: 'right', render: (item) => formatPrice(item.unitPrice) },
    { key: 'quantity', header: 'Qty', align: 'right', render: (item) => formatQuantity(item.quantity) },
    { key: 'subtotal', header: 'Subtotal', align: 'right', render: (item) => formatPrice(item.subtotal) }
  ]
  return <div className="transaction-detail">
    <dl className="transaction-detail__meta"><div><dt>Order Number</dt><dd>{order.orderNumber}</dd></div>{showOrNumber ? <div><dt>O.R Number</dt><dd>—</dd></div> : null}<div><dt>Date / Time</dt><dd>{formatManilaLongDateTime(order.orderedAt)}</dd></div><div><dt>Customer</dt><dd>{order.customer?.name ?? 'Walk-in'}</dd></div><div><dt>Station</dt><dd>{order.station.name}</dd></div><div><dt>Cashier</dt><dd>{order.cashier.name}</dd></div><div><dt>Mode of Payment</dt><dd>{order.paymentMethod === 'credit' ? 'Credit / Utang' : 'Cash'}</dd></div></dl>
    <h3>Items</h3><Table columns={columns} rows={order.items} rowKey={(item) => `${item.itemId}-${item.itemCode}`} />
    <dl className="transaction-detail__totals"><div><dt>Subtotal</dt><dd>{formatPrice(order.subtotalAmount)}</dd></div>{Number(order.discountAmount) > 0 ? <><div><dt>Senior Discount</dt><dd>-{formatPrice(order.discountAmount)}</dd></div><div><dt>Customers / Seniors</dt><dd>{order.customerCount} / {order.seniorCount}</dd></div></> : null}<div><dt>Total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>{order.paymentMethod === 'cash' ? <><div><dt>Cash</dt><dd>{order.cashReceived ? formatPrice(order.cashReceived) : '—'}</dd></div><div><dt>Change</dt><dd>{order.changeAmount ? formatPrice(order.changeAmount) : '—'}</dd></div></> : null}</dl>
  </div>
}
