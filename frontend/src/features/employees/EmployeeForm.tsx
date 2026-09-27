import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import type { UserRole } from '../../types/auth'
import type { Employee, EmployeeInput, EmployeeOptions } from '../../types/user'

export type EmployeeFieldErrors = Partial<
  Record<'name' | 'email' | 'password' | 'role' | 'station_id', string>
>

type EmployeeFormProps = {
  formId: string
  employee?: Employee
  errors: EmployeeFieldErrors
  disabled?: boolean
  options: EmployeeOptions
  onSubmit: (input: EmployeeInput) => void
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'end_user', label: 'End User' }
]

export function EmployeeForm({
  formId,
  employee,
  errors,
  disabled = false,
  options,
  onSubmit
}: EmployeeFormProps) {
  const [name, setName] = useState(employee?.name ?? '')
  const [email, setEmail] = useState(employee?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(employee?.role ?? 'end_user')
  const [stationId, setStationId] = useState(employee?.station?.id ?? 0)

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const input: EmployeeInput = {
      name: name.trim(),
      email: email.trim(),
      role,
      station_id: stationId || null
    }

    if (password) {
      input.password = password
    }

    onSubmit(input)
  }

  return (
    <form id={formId} className="employee-form" onSubmit={handleSubmit}>
      <div className="employee-form__field">
        <Label htmlFor={`${formId}-name`} required>
          Name
        </Label>
        <Input
          id={`${formId}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={255}
          required
          disabled={disabled}
          error={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-error` : undefined}
        />
        {errors.name ? (
          <span id={`${formId}-name-error`} className="page__field-error">
            {errors.name}
          </span>
        ) : null}
      </div>

      <div className="employee-form__field">
        <Label htmlFor={`${formId}-email`} required>
          Email
        </Label>
        <Input
          id={`${formId}-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          maxLength={255}
          required
          disabled={disabled}
          error={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-error` : undefined}
        />
        {errors.email ? (
          <span id={`${formId}-email-error`} className="page__field-error">
            {errors.email}
          </span>
        ) : null}
      </div>

      <div className="employee-form__field">
        <Label htmlFor={`${formId}-password`} required={!employee}>
          {employee ? 'New Password (optional)' : 'Password'}
        </Label>
        <Input
          id={`${formId}-password`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required={!employee}
          disabled={disabled}
          error={Boolean(errors.password)}
          aria-describedby={`${formId}-password-help${
            errors.password ? ` ${formId}-password-error` : ''
          }`}
        />
        <span id={`${formId}-password-help`} className="employee-form__help">
          {employee
            ? 'Leave blank to keep the current password.'
            : 'Use at least 8 characters.'}
        </span>
        {errors.password ? (
          <span id={`${formId}-password-error`} className="page__field-error">
            {errors.password}
          </span>
        ) : null}
      </div>

      <div className="employee-form__field">
        <Label htmlFor={`${formId}-station`}>Station</Label>
        <Select
          id={`${formId}-station`}
          value={stationId || ''}
          onChange={(event) => setStationId(Number(event.target.value))}
          options={[{ value: '', label: 'No Station' }, ...options.stations.map((station) => ({ value: String(station.id), label: station.name }))]}
          disabled={disabled}
          error={Boolean(errors.station_id)}
        />
        {errors.station_id ? <span className="page__field-error">{errors.station_id}</span> : null}
      </div>

      <div className="employee-form__field">
        <Label htmlFor={`${formId}-role`} required>
          Role
        </Label>
        <Select
          id={`${formId}-role`}
          value={role}
          onChange={(event) => setRole(event.target.value as UserRole)}
          options={ROLES}
          required
          disabled={disabled}
          error={Boolean(errors.role)}
          aria-describedby={errors.role ? `${formId}-role-error` : undefined}
        />
        {errors.role ? (
          <span id={`${formId}-role-error`} className="page__field-error">
            {errors.role}
          </span>
        ) : null}
      </div>
    </form>
  )
}
