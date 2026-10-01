import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import type { ConsignmentAccount } from '../../types/consignmentAccount'

export function ConsignmentAccountTable({ accounts, onEdit, onDelete }: { accounts: ConsignmentAccount[]; onEdit: (account: ConsignmentAccount) => void; onDelete: (account: ConsignmentAccount) => void }) {
  const columns: TableColumn<ConsignmentAccount>[] = [
    { key: 'name', header: 'Name', render: (account) => account.name },
    { key: 'email', header: 'Email', render: (account) => account.email },
    { key: 'station', header: 'Station', render: (account) => account.station.name },
    { key: 'consignee', header: 'Consignee', render: (account) => account.consignee.name },
    { key: 'actions', header: 'Actions', align: 'right', render: (account) => <div className="account-actions"><Button className="table-icon-action" variant="outline" aria-label={`Edit ${account.name}`} title={`Edit ${account.name}`} onClick={() => onEdit(account)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />} /><Button className="table-icon-action" variant="danger" aria-label={`Delete ${account.name}`} title={`Delete ${account.name}`} onClick={() => onDelete(account)} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />} /></div> }
  ]
  return <Table columns={columns} rows={accounts} rowKey={(account) => String(account.id)} emptyMessage="No consignment accounts found." />
}
