export const ORDER_DELIVERY_STATUS = ["uninitiated", "pending", "delivered"] as const

export type OrderDeliveryStatus = (typeof ORDER_DELIVERY_STATUS)[number]
