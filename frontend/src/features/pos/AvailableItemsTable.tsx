import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { formatPrice, formatQuantity, quantityToThousandths } from '../../lib/posCalculations'
import type { PosItem } from '../../types/pos'

export function AvailableItemsTable({ items, onAdd }: { items: PosItem[]; onAdd: (item: PosItem) => void }) {
  const columns: TableColumn<PosItem>[] = [
    { key: 'name', header: 'Item', render: (item) => <strong>{item.name}</strong> },
    { key: 'code', header: 'Code', render: (item) => item.item_code },
    { key: 'available', header: 'Available', render: (item) => formatQuantity(item.available_quantity) },
    { key: 'unit', header: 'Unit', render: (item) => item.unit },
    { key: 'price', header: 'Price', align: 'right', render: (item) => formatPrice(item.price) },
    {
      key: 'action', header: 'Action', align: 'right', render: (item) => {
        const outOfStock = (quantityToThousandths(item.available_quantity) ?? 0n) <= 0n
        return outOfStock
          ? <div className="pos-out-of-stock"><Badge tone="error">Out of Stock</Badge><Button disabled icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add</Button></div>
          : <Button onClick={() => onAdd(item)} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add</Button>
      }
    }
  ]

  return <Table columns={columns} rows={items} rowKey={(item) => String(item.id)} emptyMessage="No items found for this station." />
}
