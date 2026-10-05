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
    { key: 'name', header: 'Station Name', render: (station) => station.name },
    { key: 'location', header: 'Location', render: (station) => station.location },
    { key: 'description', header: 'Description', render: (station) => station.description || '—' },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (station) => (
        <div className="station-table__actions">
          <Button className="table-icon-action"
            variant="outline"
            aria-label={`Edit ${station.name}`}
            title={`Edit ${station.name}`}
            onClick={() => onEdit(station)}
            icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}
          />
          <Button className="table-icon-action"
            variant="danger"
            aria-label={`Delete ${station.name}`}
            title={station.assigned_users_count > 0
              ? `${station.name} cannot be deleted while users are assigned.`
              : `Delete ${station.name}`}
            disabled={station.assigned_users_count > 0}
            onClick={() => onDelete(station)}
            icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}
          />
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
