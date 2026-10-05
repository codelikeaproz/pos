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
