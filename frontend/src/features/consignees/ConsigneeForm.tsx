import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import type { Consignee, ConsigneeInput } from '../../types/consignee'

export type ConsigneeFieldErrors = Partial<Record<'name' | 'contact_number' | 'email' | 'address', string>>
type Props = { formId: string; consignee?: Consignee; errors: ConsigneeFieldErrors; disabled?: boolean; onSubmit: (input: ConsigneeInput) => void }

export function ConsigneeForm({ formId, consignee, errors, disabled = false, onSubmit }: Props) {
  const [name, setName] = useState(consignee?.name ?? '')
  const [contactNumber, setContactNumber] = useState(consignee?.contactNumber ?? '')
  const [email, setEmail] = useState(consignee?.email ?? '')
  const [address, setAddress] = useState(consignee?.address ?? '')
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSubmit({ name: name.trim(), contactNumber: contactNumber.trim() || null, email: email.trim() || null, address: address.trim() || null }) }
  return <form id={formId} className="consignee-form" onSubmit={submit}>
    <div className="consignee-form__field"><Label htmlFor={`${formId}-name`} required>Name</Label><Input id={`${formId}-name`} value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} disabled={disabled} error={Boolean(errors.name)} />{errors.name ? <span className="page__field-error">{errors.name}</span> : null}</div>
    <div className="consignee-form__field"><Label htmlFor={`${formId}-contact-number`}>Contact Number</Label><Input id={`${formId}-contact-number`} value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} maxLength={50} disabled={disabled} error={Boolean(errors.contact_number)} />{errors.contact_number ? <span className="page__field-error">{errors.contact_number}</span> : null}</div>
    <div className="consignee-form__field"><Label htmlFor={`${formId}-email`}>Email</Label><Input id={`${formId}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} disabled={disabled} error={Boolean(errors.email)} />{errors.email ? <span className="page__field-error">{errors.email}</span> : null}</div>
    <div className="consignee-form__field"><Label htmlFor={`${formId}-address`}>Address</Label><textarea id={`${formId}-address`} className={`consignee-form__textarea${errors.address ? ' consignee-form__textarea--error' : ''}`} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={1000} rows={3} disabled={disabled} />{errors.address ? <span className="page__field-error">{errors.address}</span> : null}</div>
  </form>
}
