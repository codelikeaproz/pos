export type AccountOption = { id: number; name: string }
export type ConsignmentAccount = { id: number; name: string; email: string; role: 'end_user'; station: AccountOption; consignee: AccountOption }
export type ConsignmentAccountInput = { name: string; email: string; stationId: number; consigneeId: number; password?: string; passwordConfirmation?: string }
export type ConsignmentAccountList = { accounts: ConsignmentAccount[]; currentPage: number; lastPage: number; total: number }
export type ConsignmentAccountOptions = { stations: AccountOption[]; consignees: AccountOption[] }
