import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"
import { StoreService } from "../stores/store.service"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { User, UserRoleEnum } from "../users/entity/user.entity"
import { Request } from "express"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { UserService } from "../users/user.service"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { UpdateProfileDto, updateProfileSchema } from "./dto/update-profile.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { imageFilter, memoryUpload } from "@/config/multer.config"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { PoliciesVerifiedUserGuard } from "../auth/guard/policies-handler-verifed-user.guard"
import { PoliciesHasBusinessGuard } from "../auth/guard/policy-has-business.guard"
import { PoliciesHasStoreGuard } from "../auth/guard/policy-has-store.guard"
import { BusinessService } from "../business/business.service"
import { PolicyVendorGuard } from "./guard/policy-vendor.guard"
import { VendorInterceptor } from "./interceptor/vendor.interceptor"
import { Response } from "express"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { SubscriptionService } from "../subscription/subscription.service"
import { ProductsService } from "../products/products.service"
import { OrdersService } from "../orders/orders.service"
import { PayoutsService } from "../payouts/payouts.service"
import { WithdrawalsService } from "../withdrawals/withdrawals.service"
import { ProductStatusEnum } from "../common/types"
import { PdfInterface } from "../services/utils/pdf/interface/pdf.interface"
import { VendorService } from "./vendor.service"

@Controller("vendors")
export class VendorController {
  constructor(
    private storeService: StoreService,
    private transactionHelper: TransactionHelper,
    private readonly userService: UserService,
    private bussinessService: BusinessService,
    private fileSystemService: FileSystemService,
    private readonly subscriptionService: SubscriptionService,
    private readonly productService: ProductsService,
    private readonly orderService: OrdersService,
    private readonly payoutsService: PayoutsService,
    private readonly withdrawalsService: WithdrawalsService,
    private readonly vendorService: VendorService
  ) {}

  @UseGuards(PolicyVendorGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, "VENDOR"))
  @UseInterceptors(VendorInterceptor)
  @Get("profile")
  findOne(@Req() req: Request) {
    return req.user
  }

  @UseGuards(PolicyVendorGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "VENDOR"))
  @Get("/download/:id")
  async downloadVendorProfilePdf(@Param("id", new ParseUUIDPipe()) id: string, @Res() res: Response) {
    const user = await this.userService.findById(id)
    if (!user) {
      throw new NotFoundException("Vendor not found")
    }

    if (user.role !== UserRoleEnum.Vendor) throw new BadReqException("User is not a vendor")

    const latestSubscription = await this.subscriptionService.findLatestByUserId(user.id)
    const productCounts = user.business?.store?.id
      ? await this.productService.getProductCounts(user.business.store.id, ProductStatusEnum.published)
      : { totalProduct: 0, totalPublishedOrDraftProduct: 0 }

    const orders = user.business?.store?.id
      ? await this.orderService.getStoreRevenueMetrics(user.business.store.id)
      : { totalOrder: 0, totalSales: 0, averageOrderValue: 0 }

    const payouts = user.business?.store?.id ? await this.payoutsService.findOne({ storeId: user.business.store.id }) : null

    const withdrawalStats = payouts?.id
      ? await this.withdrawalsService.getWithdrawalStats(payouts.id)
      : { lastPayout: null, pendingWithdrawalCount: 0 }

    const refinedOrders = user.business?.store?.id ? await this.orderService.getStoreOrders(user.business.store.id) : []

    const pdfData: PdfInterface = {
      profile: {
        storeName: user.business?.store?.name || "N/A",
        email: user.email || "N/A",
        phoneNumber: user.phoneNumber || "N/A",
        kycStatus: user.business?.kycStatus || "unverified",
        subscriptionStatus: latestSubscription?.status || "inactive",
        dateJoined: user.createdAt,
        orders: 0
      },
      business: {
        businessName: user.business?.name || "N/A",
        CacRegNo: user.business?.businessRegNumber || "N/A",
        kycType: user.business?.kycVerificationType || "N/A",
        kycIdentificationNumber: user.business?.identificationNumber || "N/A"
      },
      subscription: {
        status: latestSubscription?.status || "inactive",
        planType: latestSubscription?.planType || "N/A",
        paymentStatus: latestSubscription?.isPaid ? "paid" : "unpaid",
        startDate: latestSubscription?.startDate || null,
        endDate: latestSubscription?.endDate || null
      },
      product: {
        totalProduct: productCounts.totalProduct || 0,
        totalPublishedProduct: productCounts.totalPublishedOrDraftProduct || 0,
        totalOrders: 0,
        totalSales: 0,
        averageNumberOfOrder: orders.averageOrderValue || 0
      },
      payout: {
        walletBalance: payouts?.available || 0,
        totalWithdrawal: payouts?.withdrawals?.length || 0,
        pendingWithdrawal: withdrawalStats.pendingWithdrawalCount || 0,
        lastPayout: withdrawalStats.lastPayout || null
      },
      orders: refinedOrders.map((order) => ({
        id: order.id || "N/A",
        status: order.status || "N/A",
        buyerName: order.buyerName || "N/A",
        totalAmount: order.totalAmount || 0,
        dateOrdered: order.dateOrdered || null
      }))
    }

    const pdfBuffer = await this.vendorService.generateVendorPdf(pdfData)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename=vendor_profile_${user.id}.pdf`)
    res.send(pdfBuffer)
  }

  @Patch("/profile")
  @UseGuards(PoliciesVerifiedUserGuard, PoliciesHasBusinessGuard, PoliciesHasStoreGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, User))
  @UseInterceptors(FileInterceptor("logo", { ...memoryUpload, fileFilter: imageFilter }))
  async updateUserProfile(
    @Body(new JoiValidationPipe(updateProfileSchema)) updateUserProfile: UpdateProfileDto,
    @UploadedFile() fileUploaded: CustomFile,
    @Req() req: Request
  ) {
    const user = req.user

    const business = await this.bussinessService.findOne({ user: { id: user.id } })

    if (!business) throw new BadReqException("User currently has no business account")

    const store = await this.storeService.findOne({ business: { id: business.id } })

    if (!store) throw new BadReqException("User currently has no store")

    return this.transactionHelper.runInTransaction(async (manager) => {
      if (fileUploaded) {
        const fileDto: FileUploadDto = {
          destination: `images/${fileUploaded.originalname}-storelogo.${fileUploaded.extension}`,
          mimetype: fileUploaded.mimetype,
          buffer: fileUploaded.buffer,
          filePath: fileUploaded.path
        }

        const logo = await this.fileSystemService.upload(fileDto)
        // when updating logo,make sure the store object is not undefined
        if (updateUserProfile.store === undefined) {
          updateUserProfile.store = {}
        }
        updateUserProfile.store.logo = logo
      }

      await this.userService.update(user, updateUserProfile.user, manager)
      await this.bussinessService.update(business, updateUserProfile.business, manager)
      await this.storeService.update(store, updateUserProfile.store, manager)

      return "User profile updated"
    })
  }
}
