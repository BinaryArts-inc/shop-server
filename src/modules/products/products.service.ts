import { Injectable } from "@nestjs/common"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { Product } from "./entities/product.entity"
import { FindOptionsWhere, Repository } from "typeorm"
import { Store } from "../store/entities/store.entity"
import User from "../user/entity/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { FileSystemService } from "../services/filesystem/filesystem.service"

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private fileSystem: FileSystemService
  ) {}

  async handleImageUploads(uploadedFiles: Array<CustomFile>, existingImages: string[]): Promise<string[]> {
    if (!uploadedFiles || uploadedFiles.length === 0) return existingImages

    const maxImages = 5
    const productLength = existingImages.length
    if (productLength >= maxImages) {
      throw new BadReqException("Remove an image first before adding new ones")
    }
    if (uploadedFiles.length > maxImages - productLength) {
      throw new BadReqException("Image uploads exceed available space")
    }

    const uploadedUrls = await Promise.all(
      uploadedFiles.map(async (image) => {
        const fileDto: FileUploadDto = {
          destination: `images/${image.originalname}-storelogo.${image.extension}`,
          mimetype: image.mimetype,
          buffer: image.buffer,
          filePath: image.path
        }
        return this.fileSystem.getFileSystem("cloudinary").upload(fileDto)
      })
    )

    return [...existingImages, ...uploadedUrls]
  }

  async create(createProductDto: CreateProductDto, user: User, store: Store): Promise<Product> {
    const createProduct = this.productRepository.create({
      ...createProductDto,
      store: store,
      user: user
    })

    const product = await this.productRepository.save(createProduct)
    return product
  }

  async findAll() {
    const [products, total] = await this.productRepository.findAndCount({
      relations: ["store", "user"]
    })
    return [products, total]
  }

  async findOne(filter: FindOptionsWhere<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: filter,
      relations: ["store", "user"]
    })
    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productRepository.manager.transaction(async (transactionalEntityManager) => {
      const updateData = { ...updateProductDto }
      await transactionalEntityManager.update(Product, { id }, updateData)
      return transactionalEntityManager.findOne(Product, { where: { id }, relations: ["user", "store"] })
    })
  }

  async remove(id: string) {
    const remove = await this.productRepository.delete({ id: id })
    return remove
  }
}
