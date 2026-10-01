import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatQuantity } from '../../lib/posCalculations'
import type { Item } from '../../types/item'

type Props = { items: Item[]; onEdit: (item: Item) => void; onDeactivate: (item: Item) => void; onActivate: (item: Item) => void }
const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })

export function ItemTable({ items, onEdit, onDeactivate, onActivate }: Props) {
  const columns: TableColumn<Item>[] = [
    { key: 'itemCode', header: 'Item Code', render: (item) => item.item_code },
    { key: 'name', header: 'Item Name', render: (item) => item.name },
    { key: 'quantity', header: 'Quantity', render: (item) => formatQuantity(item.quantity) },
    { key: 'unit', header: 'Unit', render: (item) => item.units_backup },
    { key: 'price', header: 'Current Price', render: (item) => item.price === null ? 'No active price' : pesoFormatter.format(Number(item.price)) },
    { key: 'status', header: 'Status', render: (item) => <span className={`item-status item-status--${item.is_active ? 'active' : 'inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: (item) => <div className="item-table__actions"><Button className="table-icon-action" variant="outline" aria-label={`Edit ${item.name}`} title={`Edit ${item.name}`} onClick={() => onEdit(item)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />} />{item.is_active ? <Button className="table-icon-action" variant="outline" aria-label={`Deactivate ${item.name}`} title={`Deactivate ${item.name}`} onClick={() => onDeactivate(item)} icon={<AppIcons.deactivate size={iconSize} strokeWidth={iconStroke} />} /> : <Button className="table-icon-action" variant="outline" aria-label={`Activate ${item.name}`} title={`Activate ${item.name}`} onClick={() => onActivate(item)} icon={<AppIcons.activate size={iconSize} strokeWidth={iconStroke} />} />}</div> }
  ]
  return <Table columns={columns} rows={items} rowKey={(item) => String(item.id)} emptyMessage="No items found." />
}
