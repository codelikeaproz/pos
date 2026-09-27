import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { Item } from '../../types/item'

type Props = { items: Item[]; onEdit: (item: Item) => void; onDelete: (item: Item) => void }
const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 })

export function ItemTable({ items, onEdit, onDelete }: Props) {
  const columns: TableColumn<Item>[] = [
    { key: 'itemCode', header: 'Item Code', render: (item) => <strong>{item.item_code}</strong> },
    { key: 'name', header: 'Item Name', render: (item) => <strong>{item.name}</strong> },
    { key: 'quantity', header: 'Quantity', render: (item) => Number(item.quantity).toLocaleString('en-PH', { maximumFractionDigits: 3 }) },
    { key: 'unit', header: 'Unit', render: (item) => item.unit },
    { key: 'price', header: 'Price', render: (item) => pesoFormatter.format(Number(item.price)) },
    { key: 'actions', header: 'Actions', align: 'right', render: (item) => <div className="item-table__actions"><Button variant="outline" onClick={() => onEdit(item)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}>Edit</Button><Button variant="danger" onClick={() => onDelete(item)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>Delete</Button></div> }
  ]
  return <Table columns={columns} rows={items} rowKey={(item) => String(item.id)} emptyMessage="No items found." />
}
