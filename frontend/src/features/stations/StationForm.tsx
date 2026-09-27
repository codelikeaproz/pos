import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import type { Station, StationInput } from '../../types/station'

export type StationFieldErrors = Partial<
  Record<'name' | 'location' | 'description', string>
>

type StationFormProps = {
  formId: string
  station?: Station
  errors: StationFieldErrors
  disabled?: boolean
  onSubmit: (input: StationInput) => void
}

export function StationForm({
  formId,
  station,
  errors,
  disabled = false,
  onSubmit
}: StationFormProps) {
  const [name, setName] = useState(station?.name ?? '')
  const [location, setLocation] = useState(station?.location ?? '')
  const [description, setDescription] = useState(station?.description ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSubmit({
      name: name.trim(),
      location: location.trim(),
      description: description.trim() || null
    })
  }

  return (
    <form id={formId} className="station-form" onSubmit={handleSubmit}>
      <div className="station-form__field">
        <Label htmlFor={`${formId}-name`} required>Station Name</Label>
        <Input
          id={`${formId}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
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

      <div className="station-form__field">
        <Label htmlFor={`${formId}-location`} required>Location</Label>
        <Input
          id={`${formId}-location`}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          maxLength={255}
          required
          disabled={disabled}
          error={Boolean(errors.location)}
          aria-describedby={errors.location ? `${formId}-location-error` : undefined}
        />
        {errors.location ? (
          <span id={`${formId}-location-error`} className="page__field-error">
            {errors.location}
          </span>
        ) : null}
      </div>

      <div className="station-form__field">
        <Label htmlFor={`${formId}-description`}>Description</Label>
        <textarea
          id={`${formId}-description`}
          className={`station-form__textarea${errors.description ? ' station-form__textarea--error' : ''}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
          rows={4}
          disabled={disabled}
          aria-describedby={errors.description ? `${formId}-description-error` : undefined}
        />
        {errors.description ? (
          <span id={`${formId}-description-error`} className="page__field-error">
            {errors.description}
          </span>
        ) : null}
      </div>
    </form>
  )
}
