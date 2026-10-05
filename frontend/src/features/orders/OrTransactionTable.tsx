import { Button } from '../../components/ui/Button'
import { CustomerSortHeader, type CustomerSort } from '../../components/ui/CustomerSortHeader'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatManilaDateTime } from '../../lib/dateTime'
import { formatPrice } from '../../lib/posCalculations'
import type { OrderHistoryRow } from '../../types/order'

export function OrTransactionTable({ orders, emptyMessage, customerSort, onCustomerSort, onView }: { orders: OrderHistoryRow[]; emptyMessage: string; customerSort: CustomerSort; onCustomerSort: (value: CustomerSort) => void; onView: (order: OrderHistoryRow) => void }) {
  const columns: TableColumn<OrderHistoryRow>[] = [
    { key: 'order-number', header: 'Order Number', render: (order) => order.orderNumber },
    { key: 'or-number', header: 'O.R Number', render: () => '—' },
    { key: 'date', header: 'Date', render: (order) => formatManilaDateTime(order.orderedAt) },
    { key: 'customer', header: <CustomerSortHeader value={customerSort} onChange={onCustomerSort} />, render: (order) => order.customer?.name ?? 'Walk-in' },
    { key: 'station', header: 'Station', render: (order) => order.station.name },
    { key: 'cashier', header: 'Cashier', render: (order) => order.cashier.name },
    { key: 'total', header: 'Total', align: 'right', render: (order) => formatPrice(order.totalAmount) },
    { key: 'actions', header: 'Action', align: 'center', render: (order) => <Button className="table-icon-action" variant="outline" aria-label="View transaction details" title="View transaction details" onClick={() => onView(order)} icon={<AppIcons.view size={iconSize} strokeWidth={iconStroke} />} /> }
  ]

  return <Table columns={columns} rows={orders} rowKey={(order) => String(order.id)} emptyMessage={emptyMessage} />
}
