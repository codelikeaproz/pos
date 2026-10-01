import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { Supplier } from '../../types/supplier'

type Props = { suppliers: Supplier[]; onEdit: (supplier: Supplier) => void; onDelete: (supplier: Supplier) => void }

export function SupplierTable({ suppliers, onEdit, onDelete }: Props) {
  const columns: TableColumn<Supplier>[] = [
    { key: 'name', header: 'Supplier', render: (supplier) => supplier.name },
    { key: 'contactPerson', header: 'Contact Person', render: (supplier) => supplier.contactPerson || '—' },
    { key: 'contactNumber', header: 'Contact Number', render: (supplier) => supplier.contactNumber || '—' },
    { key: 'email', header: 'Email', render: (supplier) => supplier.email || '—' },
    { key: 'address', header: 'Address', render: (supplier) => supplier.address || '—' },
    { key: 'status', header: 'Status', render: (supplier) => <Badge tone={supplier.isActive ? 'success' : 'neutral'}>{supplier.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (supplier) => (
        <div className="supplier-table__actions">
          <Button className="table-icon-action" variant="outline" aria-label={`Edit ${supplier.name}`} title={`Edit ${supplier.name}`} onClick={() => onEdit(supplier)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />} />
          <Button className="table-icon-action" variant="danger" aria-label={`Delete ${supplier.name}`} title={`Delete ${supplier.name}`} onClick={() => onDelete(supplier)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />} />
        </div>
      )
    }
  ]

  return <Table columns={columns} rows={suppliers} rowKey={(supplier) => String(supplier.id)} emptyMessage="No suppliers found." />
}
