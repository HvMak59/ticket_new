import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createLogger } from '../app_config/logger';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from '../app_config/constants';
import { Issue } from './entities/issue.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { FindIssueDto } from './dto/find-issue.dto';

@Injectable()
export class IssueService {
  private readonly logger = createLogger(IssueService.name);

  constructor(
    @InjectRepository(Issue)
    private readonly repo: Repository<Issue>,
  ) { }

  async create(createIssueDto: CreateIssueDto) {
    const fnName = this.create.name;
    const input = `Create Object : ${JSON.stringify(createIssueDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({ id: createIssueDto.id });
    if (result) {
      this.logger.error(`${fnName} : ${DUPLICATE_RECORD} : issue ${result.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : issue ${result.id} already exists`);
    } else {
      const issueObj = this.repo.create(createIssueDto);
      this.logger.debug(`${fnName} : Created issue is : ${JSON.stringify(issueObj)}`);
      return await this.repo.save(issueObj);
    }
  }

  async update(id: string, updateissueDto: UpdateIssueDto) {
    const fnName = this.update.name;
    const input = `Id : ${id}, Update Object : ${JSON.stringify(updateissueDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const mergedissue = await this.repo.preload({ id, ...updateissueDto });
    if (mergedissue == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : issue id : ${id} not found`);
      throw new Error(`${NO_RECORD} : issue id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Merged issue is : ${JSON.stringify(mergedissue)}`);
      return await this.repo.save(mergedissue);
    }
  }

  async findAll(searchCriteria: FindIssueDto, relationsRequired: boolean = true) {
    const fnName = this.findAll.name;
    const input = `Input : Find issue with searchCriteria : ${JSON.stringify(searchCriteria)}`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // const relations = relationsRequired ? ['deviceType', 'manufacturer', 'devices'] : [];
    return this.repo.find({ where: searchCriteria, order: { name: 'ASC' } });
  }

  async findOneById(id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find issue by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const issue = await this.repo.findOne({
      where: { id },
      relations: ['deviceType', 'manufacturer', 'devices'],
    });
    if (!issue) {
      this.logger.error(`${fnName} : ${NO_RECORD} : issue id : ${id} not found`);
      throw new Error(`${NO_RECORD} : issue id : ${id} not found`);
    }
    return issue;
  }

  async delete(id: string): Promise<any> {
    const fnName = this.delete.name;
    const input = `Input : issue id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : issue id : ${id} not found`);
      throw new Error(`${NO_RECORD} : issue id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : issue id : ${id} deleted successfully`);
      return result;
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<any> {
    const fnName = this.softDelete.name;
    const input = `Input : issue id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const issue = await this.findOneById(id);
    issue.deletedBy = deletedBy;
    await this.repo.save(issue);

    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : issue id : ${id} not found`);
      throw new Error(`${NO_RECORD} : issue id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : issue id : ${id} softDeleted successfully`);
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    this.logger.debug(`${fnName} : Restoring issue id : ${id}`);

    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : issue id : ${id} not found`);
      throw new Error(`${NO_RECORD} : issue id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : issue id : ${id} restored successfully`);
      const restored = await this.findOneById(id);
      // restored.deletedBy = undefined;
      return await this.repo.save(restored);
    }
  }
}
