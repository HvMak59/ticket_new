import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entity/role.entity';
import { CreateRoleDto, UpdateRoleDto, FindRoleDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, DUPLICATE_RECORD, NO_RECORD } from '../app_config/constants';
import { RoleType } from '../common/enums';

@Injectable()
export class RoleService {
  private readonly logger = createLogger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    const fnName = this.create.name;
    const input = `Input : Create object : ${JSON.stringify(createRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({ id: createRoleDto.id });

    if (result != null) {
      this.logger.error(`${fnName} : ${result.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : ${result.id} already exists`);
    } else {
      const roleObj = this.repo.create(createRoleDto);
      this.logger.debug(`${fnName} : Role to be created is : ${JSON.stringify(roleObj)}`);
      return await this.repo.save(roleObj);
    }
  }

  findAll(searchCriteria?: FindRoleDto) {
    const fnName = this.findAll.name;
    const input = `Input : find role with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({ where: searchCriteria });
  }

  findOneById(id: RoleType) {
    const fnName = this.findOneById.name;
    const input = `Input : find role with id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    return this.repo.findOneBy({ id });
  }

  async update(id: RoleType, updateRoleDto: UpdateRoleDto) {
    const fnName = this.update.name;
    const input = `Input : id : ${id}, update Object : ${JSON.stringify(updateRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateRoleDto.id == null) {
      this.logger.debug(`${fnName} : Role id not available in UpdateDto`);
      updateRoleDto.id = id;
    } else if (updateRoleDto.id != id) {
      this.logger.error(`${fnName} : Role id : ${id} and updateRole object id : ${updateRoleDto.id} does not match`);
      throw new Error(`Role id : ${id} and update Role object: ${updateRoleDto.id} id does not match`);
    }

    const roleToUpdate = await this.findOneById(id);

    if (roleToUpdate == null) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Role id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Role id : ${id} not found`);
    } else {
      const merged = await this.repo.preload({ id, ...updateRoleDto });
      this.logger.debug(`${fnName} : Merged role is : ${JSON.stringify(merged)}`);
      return await this.repo.save(merged!);
    }
  }

  async delete(id: RoleType) {
    const fnName = this.delete.name;
    const input = `Input : delete role with id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : Role id : ${id} not found`);
      throw new Error(`${NO_RECORD} : Role id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : Role id : ${id} deleted successfully`);
      return result;
    }
  }
}
