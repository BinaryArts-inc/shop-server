import { Injectable } from "@nestjs/common"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { Product } from "./entities/product.entity"
import { FindOptionsWhere, Repository, EntityManager } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { BadReqException } from "@/exceptions/badRequest.exception"
import { FileUploadDto } from "../services/filesystem/interfaces/filesystem.interface"
import { FileSystemService } from "../services/filesystem/filesystem.service"
import { IProductsQuery } from "./interfaces/query-filter.interface"
import { SavedProduct } from "./entities/saved-product.entity"
import { PromotionTypeEnum } from "../promotions/entities/promotion.entity"
import { ProductStatusEnum } from "../common/types"

@Injectable()
export class ProductsService implements IService<Product> {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(SavedProduct) private savedProductRepository: Repository<SavedProduct>,
    private fileSystem: FileSystemService
  ) {}

  private relations = ["user", "store"]

  async create(createProductDto: CreateProductDto, manager?: EntityManager): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepository

    const createProduct = repo.create({ ...createProductDto })

    const product = await repo.save(createProduct)

    return product
  }

  async save(data: Partial<SavedProduct>): Promise<Product> {
    const saved = this.savedProductRepository.create(data)
    await this.savedProductRepository.save(saved)
    return saved.product
  }

  async unsave(data: Partial<SavedProduct>) {
    const remove = await this.savedProductRepository.delete(data)
    return remove.affected
  }

  async saved({ userId, page, limit }: IProductsQuery): Promise<[Product[], number]> {
    const [saved, count] = await this.savedProductRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: page ? page - 1 : undefined
    })

    const products = saved.map((item) => item.product)
    return [products, count]
  }

  async find({
    page,
    limit,
    status,
    stockCount = -1,
    storeId,
    categories,
    vendor,
    flag,
    search,
    rating,
    orderBy = "ASC",
    sortBy,
    userId
  }: IProductsQuery) {
    const query = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.store", "store")
      .leftJoinAndSelect("product.user", "user")
      .leftJoinAndSelect("product.reviews", "reviews")
      .orderBy("product.createdAt", orderBy)
      .addGroupBy("product.id")
      .addGroupBy("reviews.id")
      .addGroupBy("store.id")
      .addGroupBy("user.id")

    if (storeId) {
      query.andWhere("product.storeId = :storeId", { storeId })
    }

    if (status) {
      if (status !== ProductStatusEnum.draft && status !== ProductStatusEnum.published) throw new BadReqException("invalid status")
      query.andWhere("product.status = :status", { status })
    }

    if (stockCount) {
      query.andWhere("product.stockCount > :stockCount", { stockCount })
    }

    if (categories) {
      const cats = categories.split(",")
      query.andWhere("product.category IN (:...cats)", { cats })
    }

    if (vendor) {
      query.andWhere("store.type = :vendor", { vendor })
    }

    // subscribed vendors
    if (flag === "top") {
      query.andWhere("store.isStarSeller = true")
    }

    // promoted products
    if (flag === "featured") {
      query.innerJoin("product.ads", "ad").andWhere("ad.type = :adType", { adType: PromotionTypeEnum.FEATURED })
    }

    if (flag === "banner") {
      query.innerJoin("product.ads", "ad").andWhere("ad.type = :adType", { adType: PromotionTypeEnum.BANNER })
    }

    if (flag === "search") {
      query.innerJoin("product.ads", "ad").andWhere("ad.type = :adType", { adType: PromotionTypeEnum.SEARCH })
    }

    if (sortBy) {
      query.orderBy("product.price", sortBy)
    }

    if (search) {
      query.andWhere("LOWER(product.name) LIKE :search", {
        search: `%${search.toLowerCase()}%`
      })
    }

    if (rating && Number(rating) !== 0) {
      query.andWhere(
        `product.totalProductRatingCount > 0 
    AND ROUND(product.totalProductRatingSum / product.totalProductRatingCount, 1) = :rating 
  `,
        { rating: Number(rating) }
      )
    }

    if (userId) {
      query.leftJoinAndSelect("product.savedBy", "savedBy", "savedBy.userId = :userId", { userId })
      query.addGroupBy("savedBy.id")
    }

    return await query
      .take(limit)
      .skip(page && page > 0 ? (page - 1) * limit : 0)
      .getManyAndCount()
  }

  async findOne(filter: FindOptionsWhere<Product>): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: filter,
      relations: this.relations
    })
    return product
  }

  async findById(id: string): Promise<Product> {
    return await this.productRepository.findOne({ where: { id }, relations: this.relations })
  }

  async exists(filter: FindOptionsWhere<Product>): Promise<boolean> {
    return this.productRepository.exists({ where: filter })
  }

  async update(product: Product, updateProductDto: UpdateProductDto, manager?: EntityManager): Promise<Product> {
    const repo = manager ? manager.getRepository(Product) : this.productRepository

    const update = repo.create({ ...product, ...updateProductDto })

    return await repo.save(update)
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

      const promises = uploadedFiles.map(async (image) => {
        try {
          const fileDto: FileUploadDto = {
            destination: `images/logo/${image.originalname}${image.extension}`,
            mimetype: image.mimetype,
            buffer: image.buffer,
            filePath: image.path
          }
          return await this.fileSystem.upload(fileDto)
        } catch (error) {
          throw new BadReqException(`Failed to upload image ${image.originalname}: ${error.message}`)
        }
      })

      const uploadedUrls = await Promise.all(promises)

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
    const promises = uploadedFiles.map(async (image) => {
      try {
        const fileDto: FileUploadDto = {
          destination: `images/logo/${image.originalname}${image.extension}`,
          mimetype: image.mimetype,
          buffer: image.buffer,
          filePath: image.path
        }
        return await this.fileSystem.upload(fileDto)
      } catch (error) {
        throw new BadReqException(`Failed to upload image ${image.originalname}: ${error.message}`)
      }
    })

    const uploadedUrls = await Promise.all(promises)

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

  async getProductCounts(storeId: string, status: ProductStatusEnum): Promise<{ totalProduct: number; totalPublishedOrDraftProduct: number }> {
    const totalProduct = await this.productRepository.createQueryBuilder("product").where("product.storeId = :storeId", { storeId }).getCount()

    const totalPublishedOrDraftProduct = await this.productRepository
      .createQueryBuilder("product")
      .where("product.storeId = :storeId", { storeId })
      .andWhere("product.status = :status", { status: status })
      .getCount()

    return { totalProduct, totalPublishedOrDraftProduct }
  }
}
