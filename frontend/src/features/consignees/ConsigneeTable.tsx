import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { Consignee } from '../../types/consignee'

type Props = { consignees: Consignee[]; onEdit: (value: Consignee) => void; onDelete: (value: Consignee) => void }
export function ConsigneeTable({ consignees, onEdit, onDelete }: Props) {
  const columns: TableColumn<Consignee>[] = [
    { key: 'name', header: 'Name', render: (value) => <strong>{value.name}</strong> },
    { key: 'contactNumber', header: 'Contact Number', render: (value) => value.contactNumber || '—' },
    { key: 'email', header: 'Email', render: (value) => value.email || '—' },
    { key: 'actions', header: 'Actions', align: 'right', render: (value) => <div className="consignee-table__actions"><Button variant="outline" onClick={() => onEdit(value)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}>Edit</Button><Button variant="danger" onClick={() => onDelete(value)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>Delete</Button></div> }
  ]
  return <Table columns={columns} rows={consignees} rowKey={(value) => String(value.id)} emptyMessage="No consignees found." />
}
