export type DeliveryItem = { id: number; itemId: number; itemCode: string; itemName: string; unit: string; quantity: string }
export type ItemDelivery = {
  id: number
  deliveryNumber: string
  station: { id: number; name: string }
  deliveredBy: { id: number; name: string }
  receivedBy: { id: number; name: string }
  deliveredAt: string
  itemCount: number
  items?: DeliveryItem[]
}
export type DeliveryList = { deliveries: ItemDelivery[]; currentPage: number; lastPage: number; total: number }
export type DeliveryOptions = {
  stations: Array<{ id: number; name: string }>
  receivers: Array<{ id: number; name: string; email: string }>
  items: Array<{ id: number; item_code: string; name: string; units_backup: string }>
}
