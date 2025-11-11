import { Injectable } from "@nestjs/common"
import { CreateReviewDto } from "./dto/create-review.dto"
import { UpdateReviewDto } from "./dto/update-review.dto"
import { Review } from "./entities/review.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"
import { IReviewQuery } from "./interface/review-query-filter"

@Injectable()
export class ReviewsService implements IService<Review> {
  constructor(@InjectRepository(Review) private reviewRepository: Repository<Review>) {}

  async create(data: CreateReviewDto, manager?: EntityManager): Promise<Review> {
    const repo = manager ? manager.getRepository(Review) : this.reviewRepository
    const review = repo.create(data)
    return repo.save(review)
  }

  find({ page, limit, productId, reviewerId }: IReviewQuery): Promise<[Review[], number]> {
    const where: FindOptionsWhere<Review> = {}
    if (productId) {
      where.productId = productId
    }
    if (reviewerId) {
      where.reviewerId = reviewerId
    }
    return this.reviewRepository.findAndCount({
      where,
      take: limit,
      skip: page ? (page - 1) * limit : undefined,
      relations: ["product", "reviewer"]
    })
  }

  async findById(id: string): Promise<Review> {
    return this.reviewRepository.findOne({ where: { id }, relations: ["product", "reviewer"] })
  }

  async findOne(filter: FindOptionsWhere<Review>): Promise<Review> {
    return this.reviewRepository.findOne({ where: filter, relations: ["reviewer", "product"] })
  }

  async exists(filter: FindOptionsWhere<Review>): Promise<boolean> {
    return this.reviewRepository.exists({ where: filter })
  }

  async update(entity: Review, data: UpdateReviewDto, manager?: EntityManager): Promise<Review> {
    const repo = manager ? manager.getRepository(Review) : this.reviewRepository
    const updatedEntity = repo.merge(entity, data)
    return repo.save(updatedEntity)
  }
  async remove(filter: FindOptionsWhere<Review>): Promise<number> {
    const result = await this.reviewRepository.delete(filter)
    return result.affected || 0
  }
}
