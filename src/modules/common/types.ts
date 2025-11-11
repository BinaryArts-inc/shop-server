export enum ProductStatusEnum {
  draft = "draft",
  published = "published"
}

export enum ProductCategoriesEnum {
  clothings = "clothings",
  gadgets = "gadgets",
  groceries = "groceries",
  women = "women",
  bodyCreamAndOil = "bodyCreamAndOil",
  furniture = "furniture",
  tvAndHomeAppliances = "tvAndHomeAppliances",
  watchesAndAccessories = "watchesAndAccessories"
}

export const CategoriesArray = Object.values(ProductCategoriesEnum)

export const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
