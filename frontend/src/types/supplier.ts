export type Supplier = {
  id: number
  name: string
  contactPerson: string | null
  contactNumber: string | null
  email: string | null
  address: string | null
}

export type SupplierInput = Omit<Supplier, 'id'>

export type SupplierList = {
  suppliers: Supplier[]
  currentPage: number
  lastPage: number
  total: number
}
