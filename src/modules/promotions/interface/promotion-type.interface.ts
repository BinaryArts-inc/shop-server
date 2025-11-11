export const PROMOTION_TYPE = ["featured", "search", "banner"] as const

export type PromotionType = (typeof PROMOTION_TYPE)[number]
