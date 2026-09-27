export type Consignee = { id: number; name: string; contactNumber: string | null; email: string | null; address: string | null }
export type ConsigneeInput = Omit<Consignee, 'id'>
export type ConsigneeList = { consignees: Consignee[]; currentPage: number; lastPage: number; total: number }
