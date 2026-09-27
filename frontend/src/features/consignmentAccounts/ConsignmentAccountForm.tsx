import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import type { ConsignmentAccount, ConsignmentAccountInput, ConsignmentAccountOptions } from '../../types/consignmentAccount'

export type AccountErrors = Partial<Record<'name'|'email'|'station_id'|'consignee_id'|'password', string>>
type Props = { formId: string; account?: ConsignmentAccount; options: ConsignmentAccountOptions; errors: AccountErrors; disabled: boolean; onSubmit: (input: ConsignmentAccountInput) => void }
export function ConsignmentAccountForm({ formId, account, options, errors, disabled, onSubmit }: Props) {
  const [name,setName]=useState(account?.name??''); const [email,setEmail]=useState(account?.email??''); const [stationId,setStationId]=useState(account?.station.id??0); const [consigneeId,setConsigneeId]=useState(account?.consignee.id??0); const [password,setPassword]=useState(''); const [confirmation,setConfirmation]=useState('')
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();onSubmit({name:name.trim(),email:email.trim(),stationId,consigneeId,password:password||undefined,passwordConfirmation:confirmation||undefined})}
  const selectOptions=(values:{id:number;name:string}[],label:string)=>[{value:'',label},...values.map(v=>({value:String(v.id),label:v.name}))]
  return <form id={formId} className="account-form" onSubmit={submit}>
    <div><Label htmlFor={`${formId}-name`} required>Name</Label><Input id={`${formId}-name`} value={name} onChange={e=>setName(e.target.value)} required disabled={disabled} error={Boolean(errors.name)}/>{errors.name?<span className="page__field-error">{errors.name}</span>:null}</div>
    <div><Label htmlFor={`${formId}-email`} required>Email</Label><Input id={`${formId}-email`} type="email" value={email} onChange={e=>setEmail(e.target.value)} required disabled={disabled} error={Boolean(errors.email)}/>{errors.email?<span className="page__field-error">{errors.email}</span>:null}</div>
    <div><Label htmlFor={`${formId}-station`} required>Station</Label><Select id={`${formId}-station`} value={stationId||''} onChange={e=>setStationId(Number(e.target.value))} options={selectOptions(options.stations,'Select Station')} required disabled={disabled} error={Boolean(errors.station_id)}/>{errors.station_id?<span className="page__field-error">{errors.station_id}</span>:null}</div>
    <div><Label htmlFor={`${formId}-consignee`} required>Consignee</Label><Select id={`${formId}-consignee`} value={consigneeId||''} onChange={e=>setConsigneeId(Number(e.target.value))} options={selectOptions(options.consignees,'Select Consignee')} required disabled={disabled} error={Boolean(errors.consignee_id)}/>{errors.consignee_id?<span className="page__field-error">{errors.consignee_id}</span>:null}</div>
    <div><Label htmlFor={`${formId}-password`} required={!account}>Password</Label><Input id={`${formId}-password`} type="password" value={password} onChange={e=>setPassword(e.target.value)} required={!account} disabled={disabled} error={Boolean(errors.password)}/>{account?<small>Leave blank to keep the current password.</small>:null}{errors.password?<span className="page__field-error">{errors.password}</span>:null}</div>
    <div><Label htmlFor={`${formId}-confirmation`} required={!account||Boolean(password)}>Confirm Password</Label><Input id={`${formId}-confirmation`} type="password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required={!account||Boolean(password)} disabled={disabled}/></div>
  </form>
}
