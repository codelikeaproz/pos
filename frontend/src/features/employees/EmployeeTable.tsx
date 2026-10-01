import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Table, type TableColumn } from '../../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { roleLabel } from '../../types/auth'
import type { Employee } from '../../types/user'

type EmployeeTableProps = {
  employees: Employee[]
  currentUserId: number
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

export function EmployeeTable({
  employees,
  currentUserId,
  onEdit,
  onDelete
}: EmployeeTableProps) {
  const columns: TableColumn<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (employee) => (
        <span className="employee-table__name">
          {employee.name}
          {employee.id === currentUserId ? (
            <span className="employee-table__you">You</span>
          ) : null}
        </span>
      )
    },
    { key: 'email', header: 'Email', render: (employee) => employee.email },
    { key: 'station', header: 'Station', render: (employee) => employee.station?.name ?? '—' },
    {
      key: 'role',
      header: 'Role',
      render: (employee) => (
        <Badge tone={employee.role === 'admin' ? 'accent' : 'info'}>
          {roleLabel(employee.role)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (employee) => (
        <div className="employee-table__actions">
          <Button className="table-icon-action"
            variant="outline"
            aria-label={`Edit ${employee.name}`}
            title={`Edit ${employee.name}`}
            onClick={() => onEdit(employee)}
            icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />}
          />
          <Button className="table-icon-action"
            variant="danger"
            aria-label={`Delete ${employee.name}`}
            onClick={() => onDelete(employee)}
            disabled={employee.id === currentUserId}
            title={
              employee.id === currentUserId
                ? 'You cannot delete your own signed-in account.'
                : `Delete ${employee.name}`
            }
            icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}
          />
        </div>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      rows={employees}
      rowKey={(employee) => String(employee.id)}
      emptyMessage="No employees found."
    />
  )
}
