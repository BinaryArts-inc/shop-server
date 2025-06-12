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

  async handleImageUploads(uploadedFiles: Array<CustomFile>, existingImages: string[], imagesToBeReplaced: string[]): Promise<string[]> {
    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      return [...existingImages]
    }

    if (imagesToBeReplaced.length === 0) {
      const lengthOfExistingImages = existingImages.length // 1
      const lengthOfImagesToBeUploaded = uploadedFiles.length // 4
      const lengthOfTheNewImageArray = lengthOfExistingImages + lengthOfImagesToBeUploaded
      if (lengthOfTheNewImageArray > 5) {
        throw new BadReqException("Images will execeed the total of images to be uploaded")
      }
      const uploadedUrls = await Promise.all(
        uploadedFiles.map(async (image, index) => {
          try {
            const extension = image.mimetype.split("/")[1] || "jpg" // Fallback extension
            const fileDto: FileUploadDto = {
              destination: `images/${image.originalname}-storelogo-${index}.${extension}`,
              mimetype: image.mimetype,
              buffer: image.buffer,
              filePath: image.path
            }
            return await this.fileSystem.upload(fileDto)
          } catch (error) {
            throw new BadReqException(`Failed to upload image ${image.originalname}: ${error.message}`)
          }
        })
      )
      return [...existingImages, ...uploadedUrls]
    }

    // Validate that the number of uploaded files matches the images to be replaced
    if (uploadedFiles.length !== imagesToBeReplaced.length) {
      throw new BadReqException("The number of uploaded files must match the number of images to be replaced")
    }

    // Check if images to be replaced exist in existing images
    const indexesToReplace = imagesToBeReplaced.map((image) => existingImages.indexOf(image))
    if (indexesToReplace.includes(-1)) {
      throw new BadReqException("Some images to be replaced are not in the existing images")
    }

    // Clone existingImages to avoid mutating input
    const updatedImages = [...existingImages]

    // Upload new images
    const uploadedUrls = await Promise.all(
      uploadedFiles.map(async (image, index) => {
        try {
          const extension = image.mimetype.split("/")[1] || "jpg" // Fallback extension
          const fileDto: FileUploadDto = {
            destination: `images/${image.originalname}-storelogo-${index}.${extension}`,
            mimetype: image.mimetype,
            buffer: image.buffer,
            filePath: image.path
          }
          return await this.fileSystem.upload(fileDto)
        } catch (error) {
          throw new BadReqException(`Failed to upload image ${image.originalname}: ${error.message}`)
        }
      })
    )

    // Replace images at specified indexes
    indexesToReplace.forEach((index, i) => {
      updatedImages[index] = uploadedUrls[i]
    })

    // Delete old images
    await Promise.all(
      imagesToBeReplaced.map(async (imageUrl) => {
        try {
          await this.fileSystem.delete(imageUrl)
        } catch (error) {
          throw new BadReqException(`Failed to delete image ${imageUrl}: ${error.message}`)
        }
      })
    )

    return updatedImages
  }
}
