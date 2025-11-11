import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Req,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Res
} from "@nestjs/common"
import { ProductsService } from "./products.service"
import { CreateProductDto, createProductSchema } from "./dto/create-product.dto"
import { UpdateProductDto, updateProductSchema } from "./dto/update-product.dto"
import { FilesInterceptor } from "@nestjs/platform-express"
import { imageFilter, memoryUpload } from "@/config/multer.config"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { Request } from "express"
import { StoreService } from "../stores/store.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { DtoMapper } from "./interfaces/update-product-mapper.interface"
import { ProductsInterceptor } from "./interceptors/products.interceptor"
import { ProductInterceptor } from "./interceptors/product.interceptor"
import { IProductsQuery } from "./interfaces/query-filter.interface"
import { OwnProductGuard } from "./guard/ownProduct.guard"
import { CheckPolicies } from "../auth/decorators/policies-handler.decorator"
import { AppAbility } from "../services/casl/casl-ability.factory"
import { Action } from "../services/casl/actions/action"
import { Product } from "./entities/product.entity"
import { PoliciesGuard } from "../auth/guard/policies-handler.guard"
import { Public } from "../auth/decorators/public.decorator"
import { ProductCategoriesEnum } from "../common/types"
import { SaveProductDto, saveProductSchema } from "./dto/save-product.dto"
import { CsvService } from "../services/utils/csv/csv.service"
import { Response } from "express"
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private storeService: StoreService,
    private fileSystem: FileSystemService,
    private dtoMapper: DtoMapper,
    private readonly csvService: CsvService
  ) {}

  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Product))
  @UseInterceptors(FilesInterceptor("images", 5, { ...memoryUpload, fileFilter: imageFilter }), ProductInterceptor)
  async create(
    @Body(new JoiValidationPipe(createProductSchema)) createProductDto: CreateProductDto,
    @UploadedFiles() filesUploaded: Array<CustomFile>,
    @Req() req: Request
  ) {
    // find the store
    const store = await this.storeService.findOne({ id: createProductDto.storeId })
    if (!store) throw new NotFoundException("store not found")

    // handle multiple image upload
    const handleImageUploaded = await Promise.all(
      filesUploaded.map(async (image) => {
        const fileDto: FileUploadDto = {
          destination: `images/products/${image.originalname}.${image.extension}`,
          mimetype: image.mimetype,
          buffer: image.buffer,
          filePath: image.path
        }

        const url = await this.fileSystem.upload(fileDto)
        return url
      })
    )
    const slug = createProductDto.name.toLowerCase().replace(/ /g, "_")
    // attach the arry of string
    createProductDto = { ...createProductDto, images: handleImageUploaded, slug: slug }
    const user = req.user

    return await this.productsService.create({ ...createProductDto, user: user, store: store })
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, Product))
  @Get("downloads")
  async downloads(@Query() query: IProductsQuery, @Res() res: Response) {
    const [products] = await this.productsService.find(query)

    const headers = [
      { key: "productName", header: "Product Name" },
      { key: "category", header: "Category" },
      { key: "price", header: "Price" },
      { key: "stock", header: "Stock" },
      { key: "dateAdded", header: "Date Added" }
    ]

    const records = products.map((product) => {
      return {
        productName: product.name,
        category: product.category,
        price: product.price,
        stock: product.stockCount,
        dateAdded: product.createdAt.toISOString()
      }
    })

    const data = await this.csvService.writeCsvToBuffer({ headers, records })

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=products.csv")
    res.send(data)
  }

  @Post("/saves")
  @UseInterceptors(ProductInterceptor)
  async save(@Body(new JoiValidationPipe(saveProductSchema)) saveProductDto: SaveProductDto, @Req() req: Request) {
    const user = req.user
    const product = await this.productsService.findById(saveProductDto.productId)
    if (!product) throw new NotFoundException("product not found")
    return this.productsService.save({ user, product })
  }

  @Delete("/saves/:productId")
  @UseInterceptors(ProductInterceptor)
  async unsave(@Param("productId", ParseUUIDPipe) productId: string, @Req() req: Request) {
    const user = req.user
    const product = await this.productsService.findById(productId)
    if (!product) throw new NotFoundException("product not found")
    await this.productsService.unsave({ user, product })
    return product
  }

  @Get("")
  @Public()
  @UseInterceptors(ProductsInterceptor)
  async findAll(@Query() query: IProductsQuery) {
    return await this.productsService.find(query)
  }

  @Get("/saves")
  @UseInterceptors(ProductsInterceptor)
  async saved(@Query() query: IProductsQuery, @Req() req: Request) {
    return await this.productsService.saved({ ...query, userId: req.user.id })
  }

  @Get("/categories")
  @Public()
  async categories() {
    return Object.values(ProductCategoriesEnum)
  }

  @Get(":id")
  @Public()
  @UseInterceptors(ProductInterceptor)
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.productsService.findOne({ id: id })
  }

  @Patch(":id")
  @UseGuards(OwnProductGuard)
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Product))
  @UseInterceptors(FilesInterceptor("images", 5, { ...memoryUpload, fileFilter: imageFilter }), ProductInterceptor)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new JoiValidationPipe(updateProductSchema)) updateProductDto: UpdateProductDto,
    @UploadedFiles() uploadedFiles: Array<CustomFile>
  ) {
    const product = await this.productsService.findOne({ id: id })

    const images = await this.productsService.handleImageUploads(uploadedFiles, product.images, updateProductDto.images || [])

    const updateProduct: UpdateProductDto = {
      ...updateProductDto,
      userId: product.user.id
    }

    // prepare to update product
    const data = this.dtoMapper.prepareUpdateProductDto(updateProduct, product, images)

    return await this.productsService.update(product, data)
  }

  @Delete(":id")
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Product))
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    const product = await this.productsService.findById(id)
    if (!product) throw new NotFoundException("Product does not exist")

    await Promise.all(
      product.images.map(async (image) => {
        await this.fileSystem.delete(image)
      })
    )

    return await this.productsService.remove({ id })
  }
}
