import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { ITEM_UNITS, type Item, type ItemInput } from '../../types/item'

export type ItemFieldErrors = Partial<Record<'item_code' | 'name' | 'description' | 'quantity' | 'unit' | 'price', string>>

type Props = { formId: string; item?: Item; errors: ItemFieldErrors; disabled?: boolean; onSubmit: (input: ItemInput) => void }

export function ItemForm({ formId, item, errors, disabled = false, onSubmit }: Props) {
  const [itemCode, setItemCode] = useState(item?.item_code ?? '')
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [quantity, setQuantity] = useState(item?.quantity ?? '')
  const [unit, setUnit] = useState(item?.unit ?? 'pcs')
  const [price, setPrice] = useState(item?.price ?? '')

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSubmit({ item_code: itemCode.trim(), name: name.trim(), description: description.trim() || null, quantity: quantity.trim(), unit, price: price.trim() })
  }

  return (
    <form id={formId} className="item-form" onSubmit={submit}>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-item-code`} required>Item Code</Label>
        <Input id={`${formId}-item-code`} value={itemCode} onChange={(event) => setItemCode(event.target.value)} required maxLength={100} disabled={disabled} error={Boolean(errors.item_code)} aria-describedby={errors.item_code ? `${formId}-item-code-error` : undefined} placeholder="ITM-001" />
        {errors.item_code ? <span id={`${formId}-item-code-error`} className="page__field-error">{errors.item_code}</span> : null}
      </div>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-name`} required>Item Name</Label>
        <Input id={`${formId}-name`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} disabled={disabled} error={Boolean(errors.name)} aria-describedby={errors.name ? `${formId}-name-error` : undefined} />
        {errors.name ? <span id={`${formId}-name-error`} className="page__field-error">{errors.name}</span> : null}
      </div>
      <div className="item-form__row">
        <div className="item-form__field">
          <Label htmlFor={`${formId}-quantity`} required>Quantity</Label>
          <Input id={`${formId}-quantity`} type="number" inputMode="decimal" min="0" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} required disabled={disabled} error={Boolean(errors.quantity)} aria-describedby={errors.quantity ? `${formId}-quantity-error` : undefined} placeholder="0" />
          {errors.quantity ? <span id={`${formId}-quantity-error`} className="page__field-error">{errors.quantity}</span> : null}
        </div>
        <div className="item-form__field">
          <Label htmlFor={`${formId}-unit`} required>Unit</Label>
          <Input id={`${formId}-unit`} list={`${formId}-unit-suggestions`} value={unit} onChange={(event) => setUnit(event.target.value)} required maxLength={50} disabled={disabled} error={Boolean(errors.unit)} aria-describedby={errors.unit ? `${formId}-unit-error` : undefined} placeholder="Select or type a unit" />
          <datalist id={`${formId}-unit-suggestions`}>
            {ITEM_UNITS.map((option) => <option key={option} value={option} />)}
          </datalist>
          {errors.unit ? <span id={`${formId}-unit-error`} className="page__field-error">{errors.unit}</span> : null}
        </div>
      </div>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-description`}>Description</Label>
        <textarea id={`${formId}-description`} className={`item-form__textarea${errors.description ? ' item-form__textarea--error' : ''}`} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={3} disabled={disabled} aria-describedby={errors.description ? `${formId}-description-error` : undefined} />
        {errors.description ? <span id={`${formId}-description-error`} className="page__field-error">{errors.description}</span> : null}
      </div>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-price`} required>Price</Label>
        <div className="item-form__price"><span aria-hidden="true">₱</span><Input id={`${formId}-price`} type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required disabled={disabled} error={Boolean(errors.price)} aria-describedby={errors.price ? `${formId}-price-error` : undefined} placeholder="0.00" /></div>
        {errors.price ? <span id={`${formId}-price-error`} className="page__field-error">{errors.price}</span> : null}
      </div>
    </form>
  )
}
