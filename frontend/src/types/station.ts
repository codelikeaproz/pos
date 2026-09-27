export type Station = {
  id: number
  name: string
  location: string
  description: string | null
}

export type StationInput = {
  name: string
  location: string
  description: string | null
}

export type StationList = {
  stations: Station[]
  currentPage: number
  lastPage: number
  total: number
}
