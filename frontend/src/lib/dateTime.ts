const MANILA_TIME_ZONE = 'Asia/Manila'

const manilaDateTime = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short'
})

const manilaLongDateTime = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIME_ZONE,
  dateStyle: 'long',
  timeStyle: 'short'
})

const manilaDate = new Intl.DateTimeFormat('en-PH', {
  timeZone: MANILA_TIME_ZONE,
  dateStyle: 'medium'
})

export function formatManilaDateTime(value: string | Date): string {
  return manilaDateTime.format(typeof value === 'string' ? new Date(value) : value)
}

export function formatManilaLongDateTime(value: string | Date): string {
  return manilaLongDateTime.format(typeof value === 'string' ? new Date(value) : value)
}

export function formatManilaDate(value: string | Date): string {
  return manilaDate.format(typeof value === 'string' ? new Date(value) : value)
}

export function currentManilaDateTimeLocal(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {})

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
