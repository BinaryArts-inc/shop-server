import { Controller, Get, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Post, UploadedFile, Req, Query } from "@nestjs/common"
import { StoreService } from "./store.service"
import { UpdateStoreDto, updateStoreSchema } from "./dto/update-store.dto"
import { PoliciesGuard } from "../auth/guard/policies-handler.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { Store } from "./entities/store.entity"
import { StoreInterceptor } from "./interceptors/store.interceptor"
import { StoresInterceptor } from "./interceptors/stores.interceptor"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { FileInterceptor } from "@nestjs/platform-express"
import { memoryUpload, imageFilter } from "@/config/multer.config"
import { User } from "../users/decorator/user.decorator"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { CreateStoreDto, createStoreSchema } from "./dto/create-store.dto"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { ConflictException } from "@/exceptions/conflict.exception"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { UpdateStoreMapper } from "./interface/update-store-mapper-interface"
import { Request } from "express"
import { BusinessService } from "../business/business.service"
import { IStoresQuery } from "./interface/query-filter.interface"
import { Public } from "../auth/decorators/public.decorator"
@Controller("stores")
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private fileSystemService: FileSystemService,
    private businessService: BusinessService,
    private storeUpdateMapper: UpdateStoreMapper
  ) {}

  @Post("")
  @UseInterceptors(FileInterceptor("image", { ...memoryUpload, fileFilter: imageFilter }), StoreInterceptor)
  async create(
    @Body(new JoiValidationPipe(createStoreSchema)) createStoreDto: CreateStoreDto,
    @UploadedFile() fileUploaded: CustomFile,
    @User("id") userId: string
  ) {
    const business = await this.businessService.findOne({ user: { id: userId } })
    if (!business) throw new NotFoundException("Business does not exist")

    if (await this.storeService.exists({ name: createStoreDto.name })) throw new ConflictException("Store name already exist")

    const fileDto: FileUploadDto = {
      destination: `images/${fileUploaded.originalname}-storelogo.${fileUploaded.extension}`,
      mimetype: fileUploaded.mimetype,
      buffer: fileUploaded.buffer,
      filePath: fileUploaded.path
    }

    const url = await this.fileSystemService.upload(fileDto)

    createStoreDto = { ...createStoreDto, logo: url, business: business }

    return await this.storeService.create(createStoreDto)
  }

  @Get()
  @Public()
  @UseInterceptors(StoresInterceptor)
  findAll(@Query() query: IStoresQuery) {
    return this.storeService.find(query)
  }

  @Get("current")
  @UseInterceptors(StoreInterceptor)
  async findCurrent(@Req() req: Request) {
    return await this.storeService.findById(req.user.business.store.id)
  }

  @Get(":id")
  @UseInterceptors(StoreInterceptor)
  async findOne(@Param("id") id: string) {
    const store = await this.storeService.findOne({ id: id })

    if (!store) throw new NotFoundException("Store does not exist")

    return store
  }

  @Patch(":id")
  @UseInterceptors(FileInterceptor("image", { ...memoryUpload, fileFilter: imageFilter }))
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Store))
  @UseInterceptors(StoreInterceptor)
  async update(
    @Param("id") id: string,
    @Body(new JoiValidationPipe(updateStoreSchema)) updateStoreDto: UpdateStoreDto,
    @UploadedFile() fileUploaded: CustomFile
  ) {
    const store = await this.storeService.findOne({ id: id })

    if (fileUploaded) {
      const fileDto: FileUploadDto = {
        destination: `images/${fileUploaded.originalname}-storelogo.${fileUploaded.extension}`,
        mimetype: fileUploaded.mimetype,
        buffer: fileUploaded.buffer,
        filePath: fileUploaded.path
      }

      updateStoreDto.logo = await this.fileSystemService.upload(fileDto)
    }

    const updateStore = await this.storeUpdateMapper.prepareUpdateStoreMapper(updateStoreDto, store)
    return this.storeService.update(store, updateStore)
  }

  @Delete(":id")
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Store))
  remove(@Param("id") id: string) {
    return this.storeService.remove({ id: id })
  }
}
