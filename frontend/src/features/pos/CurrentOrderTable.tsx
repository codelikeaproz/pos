import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatPesoCents, formatPrice, formatQuantity, lineSubtotalCents } from '../../lib/posCalculations'
import type { CartItem } from '../../types/pos'

export function CurrentOrderTable({ items, onEdit, onRemove }: { items: CartItem[]; onEdit: (item: CartItem) => void; onRemove: (itemId: number) => void }) {
  const columns: TableColumn<CartItem>[] = [
    { key: 'item', header: 'Item', render: (item) => <div><strong>{item.name}</strong><small className="pos-cart-item__code">{item.itemCode}</small></div> },
    { key: 'quantity', header: 'Qty', render: (item) => `${formatQuantity(item.quantity)} ${item.unit}` },
    { key: 'price', header: 'Price', align: 'right', render: (item) => formatPrice(item.unitPrice) },
    { key: 'subtotal', header: 'Subtotal', align: 'right', render: (item) => <strong>{formatPesoCents(lineSubtotalCents(item.unitPrice, item.quantity))}</strong> },
    { key: 'actions', header: 'Actions', align: 'right', render: (item) => <div className="pos-cart-actions"><Button variant="outline" onClick={() => onEdit(item)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}>Edit</Button><Button variant="danger" onClick={() => onRemove(item.itemId)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>Remove</Button></div> }
  ]

  return <Table columns={columns} rows={items} rowKey={(item) => String(item.itemId)} emptyMessage="No items in the current order." />
}
