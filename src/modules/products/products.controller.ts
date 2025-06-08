import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, Req, ParseUUIDPipe } from "@nestjs/common"
import { ProductsService } from "./products.service"
import { CreateProductDto, createProductSchema } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { FilesInterceptor } from "@nestjs/platform-express"
import { diskUpload } from "@/config/multer.config"
import { JoiValidationPipe } from "@/validations/joi.validation"
import { Request } from "express"
import { StoreService } from "../store/store.service"
import { NotFoundException } from "@/exceptions/notfound.exception"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { Store } from "../store/entities/store.entity"
import { DtoMapper } from "./interfaces/update-product-mapper.interface"
import { ProductsInterceptor } from "./interceptors/products.interceptor"
import { ProductInterceptor } from "./interceptors/product.interceptor"
import { UnAuthorizedException } from "@/exceptions/unAuthorized.exception"
import { RemoveImageDto, removeImageSchema } from "./dto/removeImageDto"
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private storeService: StoreService,
    private fileSystem: FileSystemService,
    private dtoMapper: DtoMapper
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor("images", 5, { ...diskUpload }), ProductInterceptor)
  async create(
    @Body(new JoiValidationPipe(createProductSchema)) createProductDto: CreateProductDto,
    @UploadedFiles() filesUploaded: Array<CustomFile>,
    @Req() req: Request
  ) {
    // find the store
    const store = await this.storeService.findOne({ id: createProductDto.storeId })
    if (!store) throw new NotFoundException("No store to create product with, create a store before creating a product")

    // handle multiple image upload
    const handleImageUploaded = await Promise.all(
      filesUploaded.map(async (image) => {
        const fileDto: FileUploadDto = {
          destination: `images/${image.originalname}-storelogo.${image.extension}`,
          mimetype: image.mimetype,
          buffer: image.buffer,
          filePath: image.path
        }
        const url = await this.fileSystem.getFileSystem("cloudinary").upload(fileDto)
        return url
      })
    )
    // attach the arry of string
    createProductDto = {
      ...createProductDto,
      images: handleImageUploaded
    }
    const user = req.user

    return await this.productsService.create(createProductDto, user, store)
  }

  @Get()
  @UseInterceptors(ProductsInterceptor)
  async findAll() {
    return await this.productsService.findAll()
  }

  @Get(":id")
  @UseInterceptors(ProductInterceptor)
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.productsService.findOne({ id: id })
  }

  @Patch(":id")
  @UseInterceptors(FilesInterceptor("images", 5, { ...diskUpload }), ProductInterceptor)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
    @UploadedFiles() uploadedFiles: Array<CustomFile>
  ) {
    const user = req.user
    const product = await this.productsService.findOne({ id: id })

    if (!product) throw new NotFoundException("Product does not exist")

    let store: Store = null
    if (updateProductDto.storeId) {
      store = await this.storeService.findOne({ id: updateProductDto.storeId })
      if (!store) throw new BadReqException("Store does not exist")
    }
    store = store ?? product.store
    // check if user owns product
    const ownsProduct = product.user.id === user.id

    if (!ownsProduct) throw new UnAuthorizedException("You are not allowed to edit this product")

    const images = await this.productsService.handleImageUploads(uploadedFiles, product.images)

    const updateProduct: UpdateProductDto = {
      ...updateProductDto,
      user: product.user,
      store: store
    }

    // prepare to update product
    const data = this.dtoMapper.prepareUpdateProductDto(updateProduct, product, images)

    return await this.productsService.update(id, data)
  }

  @Patch("remove-images/:id")
  @UseInterceptors(ProductInterceptor)
  async removeImages(
    @Body(new JoiValidationPipe(removeImageSchema)) removeImageDto: RemoveImageDto,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request
  ) {
    const { imageUrl } = removeImageDto
    const user = req.user
    const product = await this.productsService.findOne({ id: id })
    if (!product) throw new NotFoundException("Product does not found")

    const ownsProduct = product.user.id === user.id

    if (!ownsProduct) throw new UnAuthorizedException("Not allowed to update this product")

    if (!product.images.includes(imageUrl)) throw new NotFoundException("Image does not exist")
    await this.fileSystem.getFileSystem("cloudinary").delete(imageUrl)
    const images = product.images.filter((img) => img !== imageUrl)
    const data: UpdateProductDto = {
      ...product,
      images
    }
    return await this.productsService.update(id, data)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    const product = await this.productsService.findOne({ id: id })
    if (!product) throw new NotFoundException("Product does not exist")

    await Promise.all(
      product.images.map(async (image) => {
        await this.fileSystem.getFileSystem("cloudinary").delete(image)
      })
    )

    return await this.productsService.remove(id)
  }
}
