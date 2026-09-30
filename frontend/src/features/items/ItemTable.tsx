import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatQuantity } from '../../lib/posCalculations'
import type { Item } from '../../types/item'

type Props = { items: Item[]; onEdit: (item: Item) => void; onDeactivate: (item: Item) => void; onActivate: (item: Item) => void }
const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })

export function ItemTable({ items, onEdit, onDeactivate, onActivate }: Props) {
  const columns: TableColumn<Item>[] = [
    { key: 'itemCode', header: 'Item Code', render: (item) => <strong>{item.item_code}</strong> },
    { key: 'name', header: 'Item Name', render: (item) => <strong>{item.name}</strong> },
    { key: 'quantity', header: 'Quantity', render: (item) => formatQuantity(item.quantity) },
    { key: 'unit', header: 'Unit', render: (item) => item.units_backup },
    { key: 'price', header: 'Current Price', render: (item) => item.price === null ? 'No active price' : pesoFormatter.format(Number(item.price)) },
    { key: 'status', header: 'Status', render: (item) => <span className={`item-status item-status--${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: (item) => <div className="item-table__actions"><Button variant="outline" onClick={() => onEdit(item)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}>Edit</Button>{item.is_active ? <Button variant="outline" onClick={() => onDeactivate(item)}>Deactivate</Button> : <Button variant="outline" onClick={() => onActivate(item)}>Activate</Button>}</div> }
  ]
  return <Table columns={columns} rows={items} rowKey={(item) => String(item.id)} emptyMessage="No items found." />
}
