import { User, UserRoleEnum } from "@/modules/users/entity/user.entity"
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability"
import { Injectable } from "@nestjs/common"
import { Action } from "./actions/action"
import { Product } from "@/modules/products/entities/product.entity"
import { Store } from "@/modules/stores/entities/store.entity"
import { Bank } from "@/modules/banks/entities/bank.entity"
import { ProductStatusEnum } from "@/modules/common/types"
import Business from "@/modules/business/entities/business.entity"
import { Order } from "@/modules/orders/entities/order.entity"
import { Review } from "@/modules/reviews/entities/review.entity"
import { Plan } from "@/modules/plans/entities/plan.entity"
import { Subscription } from "@/modules/subscription/entities/subscription.entity"
import { Promotion } from "@/modules/promotions/entities/promotion.entity"
import { Payout } from "@/modules/payouts/entities/payout.entity"
import { Withdrawal } from "@/modules/withdrawals/entities/withdrawal.entity"
import { Ad } from "@/modules/ads/entities/ad.entity"
import { Coupon } from "@/modules/coupons/entities/coupon.entity"
import { Voucher } from "@/modules/vouchers/entities/voucher.entity"
import { Setting } from "@/modules/settings/entities/setting.entity"

type Subjects = InferSubjects<
  | typeof User
  | typeof Product
  | typeof Business
  | typeof Store
  | typeof Bank
  | typeof Order
  | typeof Review
  | typeof Plan
  | typeof Subscription
  | typeof Payout
  | typeof Withdrawal
  | typeof Promotion
  | typeof Ad
  | typeof Coupon
  | typeof Voucher
  | typeof Setting
  | "REVENUE"
  | "VENDOR"
  | "PROFILE"
  | "NEWSLETTER"
  | "CONTACT-US"
  | "all"
>

export type AppAbility = MongoAbility<[Action, Subjects]>
type Can = AbilityBuilder<MongoAbility>["can"]
type Cannot = AbilityBuilder<MongoAbility>["cannot"]

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "all")
    } else {
      this.defineRoleForProduct(can, cannot, user)
      this.defineRoleForBusiness(can, cannot, user)
      this.defineRoleForStore(can, cannot, user)
      this.defineRoleForBank(can, cannot, user)
      this.defineRoleForUserProfile(can, cannot, user)
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
    }) as AppAbility
  }

  private defineRoleForProduct(can: Can, cannot: Cannot, user: User) {
    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Product)
      can(Action.Create, Product)
      can(Action.Update, Product, { user: { id: user.id } })
      can(Action.Delete, Product, { user: { id: user.id } })
    } else {
      can(Action.Read, Product)
    }
    cannot(Action.Delete, Product, { status: ProductStatusEnum.published }).because("You are not allowed to delete published products")
  }

  private defineRoleForBusiness(can: Can, cannot: Cannot, user: User) {
    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Business)
      can(Action.Create, Business)
      can(Action.Update, Business, { user: { id: user.id } })
      can(Action.Delete, Business, { user: { id: user.id } })
    } else {
      cannot(Action.Read, Business)
    }
  }

  private defineRoleForStore(can: Can, cannot: Cannot, user: User) {
    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Store)
      can(Action.Create, Store)
      can(Action.Update, Store)
      can(Action.Delete, Store)
    } else {
      can(Action.Read, Store)
    }
  }

  private defineRoleForBank(can: Can, cannot: Cannot, user: User) {
    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Bank)
      can(Action.Create, Bank)
      can(Action.Update, Bank, { user: { id: user.id } })
      can(Action.Delete, Bank, { user: { id: user.id } })
    } else {
      cannot(Action.Read, Bank)
    }
  }

  private defineRoleForUserProfile(can: Can, cannot: Cannot, user: User) {
    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, User, { id: user.id })
      can(Action.Update, User, { id: user.id })
      can(Action.Delete, User, { id: user.id })
    }

    cannot(Action.Delete, User)
  }

  createAbilityForVerifiedUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)
    if (user.isEmailVerified) {
      can(Action.Create, User, { id: user.id })
      can(Action.Read, User, { id: user.id })
      can(Action.Update, User, { id: user.id })
      can(Action.Delete, User, { id: user.id })
    } else {
      cannot(Action.Create, User)
      cannot(Action.Read, User)
      cannot(Action.Update, User)
      cannot(Action.Delete, User)
    }
    return build({ detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects> }) as AppAbility
  }

  createAbilityForUserWithBusiness(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)
    if (user.business) {
      can(Action.Create, User, { id: user.id })
      can(Action.Read, User, { id: user.id })
      can(Action.Update, User, { id: user.id })
      can(Action.Delete, User, { id: user.id })
    } else {
      cannot(Action.Create, User)
      cannot(Action.Read, User)
      cannot(Action.Update, User)
      cannot(Action.Delete, User)
    }
    return build({ detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects> }) as AppAbility
  }

  createAbilityForUserWithStore(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)
    if (user.business?.store) {
      can(Action.Create, User, { id: user.id })
      can(Action.Read, User, { id: user.id })
      can(Action.Update, User, { id: user.id })
      can(Action.Delete, User, { id: user.id })
    } else {
      cannot(Action.Create, User)
      cannot(Action.Read, User)
      cannot(Action.Update, User)
      cannot(Action.Delete, User)
    }
    return build({ detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects> }) as AppAbility
  }

  createAbilityForUserOrders(user: User): AppAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Order)
      can(Action.Create, Order)
      can(Action.Update, Order, { items: { storeId: user.business?.store?.id } })
      can(Action.Delete, Order, { buyerId: user.id })
    } else if (user.role === UserRoleEnum.Customer) {
      can(Action.Read, Order, { buyerId: user.id })
      can(Action.Create, Order)
      can(Action.Update, Order, { buyerId: user.id })
      can(Action.Delete, Order, { buyerId: user.id })
    } else if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Order)
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
    }) as AppAbility
  }

  createAbilityForUserReview(user: User): AppAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "Review")
    } else if (user.role === UserRoleEnum.Vendor || user.role === UserRoleEnum.Customer) {
      can(Action.Update, Review, { reviewerId: user.id })
      can(Action.Delete, Review, { reviewerId: user.id })
    }

    can(Action.Read, Review)
    can(Action.Create, Review)

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
    }) as AppAbility
  }

  createAbilityForPlan(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Plan)
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Plan)
      cannot(Action.Create, Plan)
      cannot(Action.Update, Plan)
      cannot(Action.Delete, Plan)
    } else {
      cannot(Action.Read, Plan)
      cannot(Action.Create, Plan)
      cannot(Action.Update, Plan)
      cannot(Action.Delete, Plan)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForSubscription(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Subscription)
      cannot(Action.Create, Subscription)
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Subscription)
      can(Action.Create, Subscription)
      cannot(Action.Update, Subscription)
      cannot(Action.Delete, Subscription)
    } else {
      cannot(Action.Read, Subscription)
      cannot(Action.Create, Subscription)
      cannot(Action.Update, Subscription)
      cannot(Action.Delete, Subscription)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForPayout(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Payout)
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Payout)
      can(Action.Create, Payout)
      can(Action.Update, Payout)
      cannot(Action.Delete, Payout)
    } else {
      cannot(Action.Read, Payout)
      cannot(Action.Create, Payout)
      cannot(Action.Update, Payout)
      cannot(Action.Delete, Payout)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForWithdrawal(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Withdrawal)
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Withdrawal)
      can(Action.Create, Withdrawal)
      can(Action.Update, Withdrawal)
      cannot(Action.Delete, Withdrawal)
    } else {
      cannot(Action.Read, Withdrawal)
      cannot(Action.Create, Withdrawal)
      cannot(Action.Update, Withdrawal)
      cannot(Action.Delete, Withdrawal)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForPromotions(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Promotion)
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Promotion)
      cannot(Action.Delete, Promotion)
      cannot(Action.Update, Promotion)
      cannot(Action.Create, Promotion)
    } else {
      cannot(Action.Read, Promotion)
      cannot(Action.Delete, Promotion)
      cannot(Action.Update, Promotion)
      cannot(Action.Create, Promotion)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForAds(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Ad)
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, Ad)
      can(Action.Create, Ad)
      cannot(Action.Delete, Ad)
      cannot(Action.Update, Ad)
    } else {
      can(Action.Read, Ad)
      cannot(Action.Delete, Ad)
      cannot(Action.Update, Ad)
      cannot(Action.Create, Ad)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForRevenue(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "REVENUE")
    } else if (user.role === UserRoleEnum.Vendor) {
      can(Action.Read, "REVENUE")
    } else if (user.role) {
      cannot(Action.Read, "REVENUE")
      cannot(Action.Delete, "REVENUE")
      cannot(Action.Update, "REVENUE")
      cannot(Action.Create, "REVENUE")
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForUsers(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, User)
    } else if (user.role) {
      can(Action.Read, User)
      can(Action.Delete, User, { id: user.id })
      can(Action.Update, User, { id: user.id })
      cannot(Action.Create, User)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForVendors(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "all")
    }
    if (user.role === UserRoleEnum.Vendor) {
      can(Action.Update, "VENDOR")
      can(Action.Read, "VENDOR")
    } else {
      cannot(Action.Read, "VENDOR")
      cannot(Action.Update, "VENDOR")
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForCoupons(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Coupon)
    } else if (user.role === UserRoleEnum.Customer) {
      can(Action.Read, Coupon)
      cannot(Action.Create, Coupon)
      cannot(Action.Update, Coupon)
      cannot(Action.Delete, Coupon)
    } else {
      cannot(Action.Read, Coupon)
      cannot(Action.Create, Coupon)
      cannot(Action.Update, Coupon)
      cannot(Action.Delete, Coupon)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForVouchers(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Voucher)
    } else if (user.role === UserRoleEnum.Customer) {
      can(Action.Read, Voucher)
      can(Action.Delete, Voucher)
      cannot(Action.Create, Voucher)
      cannot(Action.Update, Voucher)
    } else {
      cannot(Action.Read, Voucher)
      cannot(Action.Create, Voucher)
      cannot(Action.Delete, Voucher)
      cannot(Action.Update, Voucher)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createUserAbilityForSettings(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, Setting)
    } else {
      cannot(Action.Create, Setting)
      cannot(Action.Read, Setting)
      cannot(Action.Update, Setting)
      cannot(Action.Delete, Setting)
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }
  createUserAbilityForProfile(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "PROFILE")
    } else {
      cannot(Action.Create, "PROFILE")
      cannot(Action.Read, "PROFILE")
      cannot(Action.Update, "PROFILE")
      cannot(Action.Delete, "PROFILE")
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createUserAbilityForNewsletter(user: User): AppAbility {
    const { build, can, cannot } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "NEWSLETTER")
    } else {
      cannot(Action.Read, "NEWSLETTER")
      cannot(Action.Create, "NEWSLETTER")
      cannot(Action.Update, "NEWSLETTER")
      cannot(Action.Delete, "NEWSLETTER")
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }

  createAbilityForContactUs(user: User): AppAbility {
    const { build, can, cannot } = new AbilityBuilder(createMongoAbility)

    if (user.role === UserRoleEnum.Admin) {
      can(Action.Manage, "CONTACT-US")
    } else {
      cannot(Action.Read, "CONTACT-US")
      cannot(Action.Create, "CONTACT-US")
      cannot(Action.Update, "CONTACT-US")
      cannot(Action.Delete, "CONTACT-US")
    }

    const ability = build({
      detectSubjectType: (item) => {
        return item.constructor as ExtractSubjectType<Subjects>
      }
    }) as AppAbility

    return ability
  }
}
