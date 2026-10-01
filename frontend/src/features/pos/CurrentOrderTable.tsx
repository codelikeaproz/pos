import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatPesoCents, formatPrice, formatPosQuantity, lineSubtotalCents } from '../../lib/posCalculations'
import type { CartItem } from '../../types/pos'

export function CurrentOrderTable({ items, onEdit, onRemove }: { items: CartItem[]; onEdit: (item: CartItem) => void; onRemove: (itemId: number) => void }) {
  const columns: TableColumn<CartItem>[] = [
    { key: 'item', header: 'Item', render: (item) => item.name },
    { key: 'code', header: 'Item Code', render: (item) => item.itemCode },
    { key: 'quantity', header: 'Qty', render: (item) => `${formatPosQuantity(item.quantity)} ${item.unit}` },
    { key: 'price', header: 'Price', align: 'right', render: (item) => formatPrice(item.unitPrice) },
    { key: 'subtotal', header: 'Subtotal', align: 'right', render: (item) => formatPesoCents(lineSubtotalCents(item.unitPrice, item.quantity)) },
    { key: 'actions', header: 'Actions', align: 'right', render: (item) => <div className="pos-cart-actions"><Button className="table-icon-action" variant="outline" aria-label={`Edit quantity for ${item.name}`} title={`Edit quantity for ${item.name}`} onClick={() => onEdit(item)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />} /><Button className="table-icon-action" variant="danger" aria-label={`Remove ${item.name} from order`} title={`Remove ${item.name} from order`} onClick={() => onRemove(item.itemId)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />} /></div> }
  ]

  return <Table columns={columns} rows={items} rowKey={(item) => String(item.itemId)} emptyMessage="No items in the current order." />
}
