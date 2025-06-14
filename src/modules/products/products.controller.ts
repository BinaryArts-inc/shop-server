import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, Req, ParseUUIDPipe, Query } from "@nestjs/common"
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
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { IProductsQuery } from "./interfaces/query-filter.interface"
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private storeService: StoreService,
    private fileSystem: FileSystemService,
    private dtoMapper: DtoMapper
  ) {}

  @Post()
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
          destination: `images/logo/${image.originalname}${image.extension}`,
          mimetype: image.mimetype,
          buffer: image.buffer,
          filePath: image.path
        }

        const url = await this.fileSystem.upload(fileDto)
        return url
      })
    )
    // attach the arry of string
    createProductDto = { ...createProductDto, images: handleImageUploaded }
    const user = req.user

    return await this.productsService.create({ ...createProductDto, user: user, store: store })
  }

  @Get()
  @UseInterceptors(ProductsInterceptor)
  async findAll(@Query() query: IProductsQuery) {
    return await this.productsService.find(query)
  }

  @Get(":id")
  @UseInterceptors(ProductInterceptor)
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.productsService.findOne({ id: id })
  }

  @Patch(":id")
  @UseInterceptors(FilesInterceptor("images", 5, { ...memoryUpload, fileFilter: imageFilter }), ProductInterceptor)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new JoiValidationPipe(updateProductSchema)) updateProductDto: UpdateProductDto,
    @Req() req: Request,
    @UploadedFiles() uploadedFiles: Array<CustomFile>
  ) {
    const user = req.user

    const product = await this.productsService.findOne({ id: id })

    if (!product) throw new NotFoundException("Product does not exist")

    // check if user owns product
    const ownsProduct = product.user.id === user.id

    if (!ownsProduct) throw new UnAuthorizedException("You are not allowed to edit this product")

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
