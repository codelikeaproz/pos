import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { Supplier } from '../../types/supplier'

type Props = { suppliers: Supplier[]; onEdit: (supplier: Supplier) => void; onDelete: (supplier: Supplier) => void }

export function SupplierTable({ suppliers, onEdit, onDelete }: Props) {
  const columns: TableColumn<Supplier>[] = [
    { key: 'name', header: 'Supplier', render: (supplier) => <strong>{supplier.name}</strong> },
    { key: 'contactPerson', header: 'Contact Person', render: (supplier) => supplier.contactPerson || '—' },
    { key: 'contactNumber', header: 'Contact Number', render: (supplier) => supplier.contactNumber || '—' },
    { key: 'email', header: 'Email', render: (supplier) => supplier.email || '—' },
    { key: 'address', header: 'Address', render: (supplier) => supplier.address || '—' },
    { key: 'status', header: 'Status', render: (supplier) => <Badge tone={supplier.isActive ? 'success' : 'neutral'}>{supplier.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (supplier) => (
        <div className="supplier-table__actions">
          <Button variant="outline" onClick={() => onEdit(supplier)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}>Edit</Button>
          <Button variant="danger" onClick={() => onDelete(supplier)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>Delete</Button>
        </div>
      )
    }
  ]

  return <Table columns={columns} rows={suppliers} rowKey={(supplier) => String(supplier.id)} emptyMessage="No suppliers found." />
}
