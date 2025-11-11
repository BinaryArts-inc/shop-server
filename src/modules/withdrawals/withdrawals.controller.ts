import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Query, Req, UseGuards, UseInterceptors } from "@nestjs/common"
import { WithdrawalsService } from "./withdrawals.service"
import { PolicyWithdrawalGuard } from "./guards/policy-withdrawal.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { Action } from "../services/casl/actions/action"
import { Withdrawal } from "./entities/withdrawal.entity"
import { WithdrawalResponseInterceptor } from "./interceptors/withdrawal.interceptor"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { CreateWithdrawalDto, createWithdrawalSchema } from "./dto/create-withdrawal.dto"
import { Request } from "express"
import { BankService } from "../banks/bank.service"
import { PaymentsService } from "../services/payments/payments.service"
import { TransactionHelper } from "../services/utils/transactions/transactions.service"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { PayoutsService } from "../payouts/payouts.service"
import { ApiException } from "@/exceptions/api.exception"
import { WithdrawalsResponseInterceptor } from "./interceptors/withdrawals.interceptor"
import { WithdrawalDecision, withdrawalDecisionSchema } from "./dto/withdrawal-decision.dto"
import { IWithdrawalQuery } from "./interfaces/query-filter.interface"
import { SettingsService } from "../settings/settings.service"

@Controller("withdrawals")
export class WithdrawalsController {
  constructor(
    private readonly withdrawalsService: WithdrawalsService,
    private readonly bankService: BankService,
    private readonly paymentsService: PaymentsService,
    private readonly transactionHelper: TransactionHelper,
    private readonly payoutsService: PayoutsService,
    private readonly settingsService: SettingsService
  ) {}

  @Post("")
  @UseGuards(PolicyWithdrawalGuard)
  @CheckPolicies((ability) => ability.can(Action.Create, Withdrawal))
  @UseInterceptors(WithdrawalResponseInterceptor)
  async withdraw(@Body(new JoiValidationPipe(createWithdrawalSchema)) dto: CreateWithdrawalDto, @Req() req: Request) {
    return await this.transactionHelper.runInTransaction(async (manager) => {
      const storeId = req.user.business.store.id
      const settings = await this.settingsService.getSettings()

      if (!settings) throw new NotFoundException("Setting not found")

      const maximumPayout = settings.revenueSetting.maxPayoutAmount
      const minimumPayout = settings.revenueSetting.minPayoutAmount

      if (dto.amount > maximumPayout) {
        throw new BadReqException(`Withdrawal amount exceeds maximum allowed payout of ${maximumPayout}`)
      } else if (dto.amount < minimumPayout) {
        throw new BadReqException(`Withdrawal amount is below minimum allowed payout of ${minimumPayout}`)
      }

      const bank = await this.bankService.findById(dto.bankId)
      if (!bank) throw new NotFoundException("bank not found")
      if (!bank.isMyBank(req.user.id)) throw new BadReqException("invalid bank")

      const payout = await this.payoutsService.findOne({ storeId })
      if (!payout) throw new NotFoundException("payout not found")

      const currentBalance = payout.available

      if (dto.amount > currentBalance) throw new BadReqException("Insufficient fund")

      const updatePayoutDto = payout.handleWithdaw(dto.amount)

      const updatedPayout = await this.payoutsService.update(payout, updatePayoutDto, manager)

      const withdrawal = await this.withdrawalsService.create(
        { amount: dto.amount, payout: updatedPayout, bank, bankId: bank.id, currentWalletBalance: currentBalance },
        manager
      )

      return withdrawal
    })
  }

  @Post("/decision")
  @UseGuards(PolicyWithdrawalGuard)
  @CheckPolicies((ability) => ability.can(Action.Manage, Withdrawal))
  async decision(@Body(new JoiValidationPipe(withdrawalDecisionSchema)) dto: WithdrawalDecision, @Req() req: Request) {
    const user = req.user
    const withdrawal = await this.withdrawalsService.findOne({ id: dto.withdrawalId, status: "pending" })
    if (!withdrawal) throw new NotFoundException("withdrawal not found")

    const settings = await this.settingsService.getSettings()

    if (!settings) throw new NotFoundException("Setting not found")

    const maximumPayout = settings.revenueSetting.maxPayoutAmount
    const minimumPayout = settings.revenueSetting.minPayoutAmount

    if (withdrawal.amount > maximumPayout) {
      throw new BadReqException(`Withdrawal amount exceeds maximum allowed payout of ${maximumPayout}`)
    } else if (withdrawal.amount < minimumPayout) {
      throw new BadReqException(`Withdrawal amount is below minimum allowed payout of ${minimumPayout}`)
    }

    if (dto.decision === "approve") {
      const balance = await this.paymentsService.checkBalance()
      // balance.
      // ADMIN SHOULD BE NOTIFIED OF THIS!
      if (withdrawal.amount > balance[0].balance) throw new ApiException("service unavailable", 503)

      await this.transactionHelper.runInTransaction(async (manager) => {
        await this.withdrawalsService.update(withdrawal, { status: "approved", processedById: user.id, dateApproved: new Date() }, manager)
        await this.paymentsService.transfer({
          amount: withdrawal.amount,
          reference: withdrawal.id,
          recipient: withdrawal.bank.recipientCode,
          reason: `${withdrawal.bank.user.getFullName()} initiated withdrawal`
        })
      })
    } else if (dto.decision === "reject") {
      return this.transactionHelper.runInTransaction(async (manager) => {
        await this.payoutsService.update(withdrawal.payout, withdrawal.payout.handleWithdrawFailed(withdrawal.amount), manager)
        await this.withdrawalsService.update(withdrawal, { status: "rejected" }, manager)
      })
    }

    return
  }

  @Get("")
  @CheckPolicies((ability) => ability.can(Action.Read, Withdrawal))
  @UseInterceptors(WithdrawalsResponseInterceptor)
  async find(@Query() query: IWithdrawalQuery) {
    return await this.withdrawalsService.find(query)
  }

  @Get(":id")
  @CheckPolicies((ability) => ability.can(Action.Read, Withdrawal))
  @UseInterceptors(WithdrawalResponseInterceptor)
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.withdrawalsService.findById(id)
  }
}
