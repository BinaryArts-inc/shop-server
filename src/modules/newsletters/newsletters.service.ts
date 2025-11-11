import { Injectable } from "@nestjs/common"
import { CreateNewsletterDto } from "./dto/create-newsletter.dto"
import { UpdateNewsletterDto } from "./dto/update-newsletter.dto"
import { Newsletter } from "./entities/newsletter.entity"
import { EntityManager, FindOptionsWhere, Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class NewslettersService implements IService<Newsletter> {
  constructor(@InjectRepository(Newsletter) private readonly newsletterRepository: Repository<Newsletter>) {}

  async create(data: CreateNewsletterDto, manager?: EntityManager): Promise<Newsletter> {
    const repo = manager ? manager.getRepository<Newsletter>(Newsletter) : this.newsletterRepository
    const create = repo.create(data)
    return await repo.save(create)
  }

  async find(): Promise<[Newsletter[], number]> {
    return await this.newsletterRepository.findAndCount()
  }

  async findById(id: string): Promise<Newsletter> {
    return await this.newsletterRepository.findOne({ where: { id } })
  }

  async findOne(filter: FindOptionsWhere<Newsletter>): Promise<Newsletter> {
    return await this.newsletterRepository.findOne({ where: filter })
  }

  async exists(filter: FindOptionsWhere<Newsletter>): Promise<boolean> {
    return await this.newsletterRepository.exists({ where: filter })
  }

  async update(entity: Newsletter, data: UpdateNewsletterDto, manager?: EntityManager): Promise<Newsletter> {
    const repo = manager ? manager.getRepository(Newsletter) : this.newsletterRepository
    Object.assign(entity, data)
    return await repo.save(entity)
  }

  async remove(filter: FindOptionsWhere<Newsletter>): Promise<number> {
    const result = await this.newsletterRepository.delete(filter)
    return result.affected || 0
  }
}
