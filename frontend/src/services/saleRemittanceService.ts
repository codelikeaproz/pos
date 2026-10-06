import { apiRequest } from './apiClient'
import type { SaleRemittanceList, SaleRemittanceRow } from '../types/saleRemittance'
import type { StatusSort } from '../components/ui/StatusSortHeader'

export async function loadSaleRemittances(search:string, fromDate:string, toDate:string, statusSort:StatusSort, page:number, perPage:number, signal?:AbortSignal):Promise<SaleRemittanceList> {
  const params=new URLSearchParams({page:String(page),per_page:String(perPage)}); if(search)params.set('search',search); if(fromDate)params.set('from_date',fromDate); if(toDate)params.set('to_date',toDate); if(statusSort)params.set('status_sort',statusSort)
  const response=await apiRequest<{data:SaleRemittanceRow[];meta:{current_page:number;last_page:number;total:number}}>(`/api/sale-remittances?${params}`,{signal})
  return {orders:response.data,currentPage:response.meta.current_page,lastPage:response.meta.last_page,total:response.meta.total}
}
export function remitSales(orderIds:number[]):Promise<{message:string;remittedCount:number;remitTotal:string}>{return apiRequest('/api/sale-remittances',{method:'POST',body:{order_ids:orderIds}})}
