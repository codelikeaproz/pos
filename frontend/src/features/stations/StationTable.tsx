import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { Station } from '../../types/station'

type StationTableProps = {
  stations: Station[]
  onEdit: (station: Station) => void
  onDelete: (station: Station) => void
}

export function StationTable({ stations, onEdit, onDelete }: StationTableProps) {
  const columns: TableColumn<Station>[] = [
    { key: 'name', header: 'Station Name', render: (station) => <strong>{station.name}</strong> },
    { key: 'location', header: 'Location', render: (station) => station.location },
    { key: 'description', header: 'Description', render: (station) => station.description || '—' },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (station) => (
        <div className="station-table__actions">
          <Button
            variant="outline"
            onClick={() => onEdit(station)}
            icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(station)}
            icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      rows={stations}
      rowKey={(station) => String(station.id)}
      emptyMessage="No stations found."
    />
  )
}
