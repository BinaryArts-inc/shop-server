import { Injectable } from "@nestjs/common"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { Product } from "./entities/product.entity"
import { FindOptionsWhere, Repository, FindManyOptions, Equal, EntityManager } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { IProductsQuery } from "./interfaces/query-filter.interface"

@Injectable()
export class ProductsService implements IService<Product> {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private fileSystem: FileSystemService
  ) {}

  async create(createProductDto: CreateProductDto, manager?: EntityManager): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepository

    const createProduct = repo.create({ ...createProductDto })

    const product = await repo.save(createProduct)

    return product
  }

  async find({ page, limit, status, stockCount, storeId }: IProductsQuery) {
    const where: FindManyOptions<Product>["where"] = {}

    if (storeId) {
      where.storeId = storeId
    }

    if (status) {
      where.status = status
    }

    if (stockCount) {
      where.stockCount = Equal(stockCount)
    }

    return await this.productRepository.findAndCount({
      where,
      relations: ["store", "user"],
      take: limit,
      skip: page ? page - 1 : undefined
    })
  }

  async findOne(filter: FindOptionsWhere<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: filter,
      relations: ["store", "user"]
    })
    return product
  }

  async findById(id: string): Promise<Product> {
    return await this.productRepository.findOne({ where: { id } })
  }

  async exists(filter: FindOptionsWhere<Product>): Promise<boolean> {
    return this.productRepository.exists({ where: filter })
  }

  async update(product: Product, updateProductDto: UpdateProductDto, manager?: EntityManager): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepository

    const update = repo.create({ ...product, ...updateProductDto })

    return repo.save(update)
  }

  async remove(filter: FindOptionsWhere<Product>) {
    const remove = await this.productRepository.delete(filter)
    return remove.affected
  }

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
}
