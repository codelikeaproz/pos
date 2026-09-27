import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { StationItem } from '../../types/stationItem'

export function StationInventoryTable({ rows, onEdit, onRemove, emptyMessage }: { rows: StationItem[]; onEdit: (row: StationItem) => void; onRemove: (row: StationItem) => void; emptyMessage: string }) {
  const columns: TableColumn<StationItem>[] = [
    { key: 'item', header: 'Item', render: (row) => <strong>{row.item.name}</strong> },
    { key: 'code', header: 'Code', render: (row) => row.item.item_code },
    { key: 'unit', header: 'Unit', render: (row) => row.item.units_backup },
    { key: 'quantity', header: 'Quantity', render: (row) => Number(row.quantity).toLocaleString('en-PH', { maximumFractionDigits: 3 }) },
    { key: 'reorderPoint', header: 'Reorder Point', render: (row) => Number(row.item.reorder_point).toLocaleString('en-PH', { maximumFractionDigits: 3 }) },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.is_low_stock ? 'warning' : 'success'}>{row.is_low_stock ? 'Low Stock' : 'In Stock'}</Badge> },
    { key: 'actions', header: 'Actions', align: 'right', render: (row) => <div className="station-inventory-table__actions"><Button variant="outline" onClick={() => onEdit(row)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}>Edit Inventory</Button><Button variant="danger" onClick={() => onRemove(row)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>Remove</Button></div> }
  ]
  return <Table columns={columns} rows={rows} rowKey={(row) => String(row.id)} emptyMessage={emptyMessage} />
}
