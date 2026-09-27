import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import type { Supplier, SupplierInput } from '../../types/supplier'

export type SupplierFieldErrors = Partial<
  Record<'name' | 'contact_person' | 'contact_number' | 'email' | 'address' | 'is_active', string>
>

type Props = {
  formId: string
  supplier?: Supplier
  errors: SupplierFieldErrors
  disabled?: boolean
  onSubmit: (input: SupplierInput) => void
}

export function SupplierForm({ formId, supplier, errors, disabled = false, onSubmit }: Props) {
  const [name, setName] = useState(supplier?.name ?? '')
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson ?? '')
  const [contactNumber, setContactNumber] = useState(supplier?.contactNumber ?? '')
  const [email, setEmail] = useState(supplier?.email ?? '')
  const [address, setAddress] = useState(supplier?.address ?? '')
  const [isActive, setIsActive] = useState(supplier?.isActive ?? true)

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSubmit({
      name: name.trim(),
      contactPerson: contactPerson.trim() || null,
      contactNumber: contactNumber.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      isActive
    })
  }

  const field = (
    key: 'name' | 'contact_person' | 'contact_number' | 'email',
    label: string,
    value: string,
    setValue: (value: string) => void,
    options: { required?: boolean; type?: string; maxLength?: number } = {}
  ) => (
    <div className="supplier-form__field">
      <Label htmlFor={`${formId}-${key}`} required={options.required}>{label}</Label>
      <Input
        id={`${formId}-${key}`}
        type={options.type}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required={options.required}
        maxLength={options.maxLength ?? 255}
        disabled={disabled}
        error={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${formId}-${key}-error` : undefined}
      />
      {errors[key] ? <span id={`${formId}-${key}-error`} className="page__field-error">{errors[key]}</span> : null}
    </div>
  )

  return (
    <form id={formId} className="supplier-form" onSubmit={submit}>
      {field('name', 'Supplier Name', name, setName, { required: true })}
      {field('contact_person', 'Contact Person', contactPerson, setContactPerson)}
      {field('contact_number', 'Contact Number', contactNumber, setContactNumber, { maxLength: 50 })}
      {field('email', 'Email', email, setEmail, { type: 'email' })}
      <div className="supplier-form__field">
        <Label htmlFor={`${formId}-is-active`} required>Status</Label>
        <Select id={`${formId}-is-active`} value={isActive ? 'active' : 'inactive'} onChange={(event) => setIsActive(event.target.value === 'active')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} disabled={disabled} error={Boolean(errors.is_active)} />
        {errors.is_active ? <span className="page__field-error">{errors.is_active}</span> : null}
      </div>
      <div className="supplier-form__field">
        <Label htmlFor={`${formId}-address`}>Address</Label>
        <textarea
          id={`${formId}-address`}
          className={`supplier-form__textarea${errors.address ? ' supplier-form__textarea--error' : ''}`}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          maxLength={1000}
          rows={3}
          disabled={disabled}
          aria-describedby={errors.address ? `${formId}-address-error` : undefined}
        />
        {errors.address ? <span id={`${formId}-address-error`} className="page__field-error">{errors.address}</span> : null}
      </div>
    </form>
  )
}
