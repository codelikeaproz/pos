export type Customer = { id: number; name: string; address: string; balance: string | null }
export type CustomerList = { customers: Customer[]; currentPage: number; lastPage: number; total: number }
