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
  onStatusChange: (employee: Employee) => void
}

export function EmployeeTable({
  employees,
  currentUserId,
  onEdit,
  onStatusChange
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
    { key: 'sex', header: 'Sex', render: (employee) => employee.sex === 'female' ? 'Female' : 'Male' },
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
    { key: 'status', header: 'Status', render: (employee) => <Badge tone={employee.is_active ? 'success' : 'error'}>{employee.is_active ? 'Active' : 'Inactive'}</Badge> },
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
            variant="outline"
            aria-label={`${employee.is_active ? 'Deactivate' : 'Reactivate'} ${employee.name}`}
            onClick={() => onStatusChange(employee)}
            disabled={employee.id === currentUserId}
            title={
              employee.id === currentUserId
                ? 'You cannot deactivate your own signed-in account.'
                : `${employee.is_active ? 'Deactivate' : 'Reactivate'} ${employee.name}`
            }
            icon={employee.is_active ? <AppIcons.deactivate size={iconSize} strokeWidth={iconStroke} /> : <AppIcons.activate size={iconSize} strokeWidth={iconStroke} />}
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
