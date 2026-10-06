import { Table, type TableColumn } from '../../components/ui/Table'
import { StockQuantity } from '../../components/ui/StockQuantity'
import { formatQuantity } from '../../lib/posCalculations'
import type { StationItem } from '../../types/stationItem'

export function StationInventoryTable({ rows, emptyMessage }: { rows: StationItem[]; emptyMessage: string }) {
  const columns: TableColumn<StationItem>[] = [
    { key: 'item', header: 'Description', render: (row) => row.item.name },
    { key: 'code', header: 'Item Code', render: (row) => row.item.item_code },
    { key: 'quantity', header: 'Qty', align: 'right', render: (row) => formatQuantity(row.reconciled_quantity) },
    { key: 'sold', header: 'Sold', align: 'right', render: (row) => formatQuantity(row.recorded_sold_quantity) },
    { key: 'spoilage', header: 'Spoilage', align: 'right', render: (row) => formatQuantity(row.recorded_spoilage_quantity) },
    { key: 'remaining', header: 'Remaining Qty', align: 'right', render: (row) => <StockQuantity quantity={row.current_quantity} isLowStock={row.is_low_stock} /> }
  ]
  return <Table columns={columns} rows={rows} rowKey={(row) => String(row.id)} rowClassName={(row) => row.is_low_stock ? 'ui-table__row--danger' : undefined} emptyMessage={emptyMessage} />
}
